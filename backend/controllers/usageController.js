const WaterUsage = require('../models/WaterUsage');
const Bill = require('../models/Bill');
const calculateBill = require('../utils/billCalculator');
const getSuggestions = require('../utils/suggestionEngine');
const Alert = require('../models/Alert');
const sendEmail = require('../utils/emailService');

// @desc    Add weekly water usage
// @route   POST /api/usage
// @access  Private
const addWaterUsage = async (req, res) => {
    const { categories, numPeople, weekStarting } = req.body;

    if (!categories || !numPeople || !weekStarting) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Calculate total liters
    const totalLiters = Object.values(categories).reduce((acc, curr) => acc + curr, 0);

    const usage = new WaterUsage({
        user: req.user._id,
        weekStarting: new Date(weekStarting),
        categories,
        numPeople,
        totalLiters
    });

    const createdUsage = await usage.save();

    // PHASE 4: Auto-generate bill
    const { totalCost, slabBreakdown } = calculateBill(totalLiters);
    const bill = new Bill({
        user: req.user._id,
        usage: createdUsage._id,
        amount: totalCost,
        slabBreakdown
    });
    await bill.save();

    // Send Bill Generation Email (fire-and-forget so user isn't blocked waiting)
    sendEmail({
            email: req.user.email,
            subject: 'Weekly Water Report & Bill Generated - AquaSmart',
            message: `Hi ${req.user.firstName},\n\nYour water usage for the week of ${new Date(weekStarting).toLocaleDateString()} has been recorded.\n\nTotal Usage: ${totalLiters}L\nTotal Bill Amount: ₹${totalCost}\n\nYou can view the detailed breakdown and pay your bill on the AquaSmart dashboard.\n\nThank you for being an eco-conscious user!\n\nAquaSmart Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Weekly Water Report</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p>Hi <strong>${req.user.firstName}</strong>,</p>
                        <p>Your water usage for the week starting <strong>${new Date(weekStarting).toLocaleDateString()}</strong> has been successfully recorded.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #1e40af;">Usage Summary</h3>
                            <p style="margin: 5px 0;"><strong>Total Consumption:</strong> ${totalLiters} Liters</p>
                            <p style="margin: 5px 0;"><strong>Current Bill Amount:</strong> <span style="font-size: 1.25rem; color: #2563eb; font-weight: bold;">₹${totalCost}</span></p>
                        </div>

                        <h4 style="color: #4b5563;">Category Breakdown:</h4>
                        <ul style="list-style: none; padding: 0;">
                            ${Object.entries(categories).map(([cat, liters]) => `
                                <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                    <span style="text-transform: capitalize;">${cat}:</span>
                                    <strong>${liters}L</strong>
                                </li>
                            `).join('')}
                        </ul>

                        <p style="margin-top: 30px;">Please log in to the dashboard to view your full history and complete the payment.</p>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:5173/bills" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">View & Pay Bill</a>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">This is an automated message from Aqua Smart. Please do not reply.</p>
                    </div>
                </div>
            `
        }).catch(err => console.error('Bill generation email failed:', err.message));

    // PHASE 5: Leak Detection & High Usage Alerts
    const previousUsage = await WaterUsage.findOne({ 
        user: req.user._id, 
        _id: { $ne: createdUsage._id } 
    }).sort({ weekStarting: -1 });

    let leakAlert = false;
    let highUsageAlert = false;

    // 1. Leak Detection (30% increase)
    if (previousUsage) {
        const increasePercentage = ((totalLiters - previousUsage.totalLiters) / previousUsage.totalLiters) * 100;
        if (increasePercentage > 30) {
            leakAlert = true;
            await Alert.create({
                user: req.user._id,
                title: 'Leak Detected ⚠️',
                message: `Your water usage has increased by ${increasePercentage.toFixed(2)}% since last week. Please check for leaks!`,
                type: 'leak',
                severity: 'high'
            });

            // Send Email (fire-and-forget)
            sendEmail({
                    email: req.user.email,
                    subject: '⚠️ Alert: Possible Water Leak Detected',
                    message: `Hi ${req.user.firstName},\n\nWe detected a significant increase (${increasePercentage.toFixed(2)}%) in your water usage this week compared to last. This may indicate a leak.\n\nTotal Usage: ${totalLiters}L\nPrevious Usage: ${previousUsage.totalLiters}L\n\nPlease check your plumbing fixtures and appliances.\n\nEco Regards,\nAquaSmart Team`,
                }).catch(err => console.error('Leak email failed:', err.message));
        }
    }

    // 2. High Usage Alert (>5000L)
    if (totalLiters > 5000) {
        highUsageAlert = true;
        await Alert.create({
            user: req.user._id,
            title: 'High Usage Warning',
            message: `Your weekly usage of ${totalLiters}L exceeds the 5000L recommended limit.`,
            type: 'high_usage',
            severity: 'medium'
        });

        // Send Email (fire-and-forget)
        sendEmail({
                email: req.user.email,
                subject: '⚠️ Warning: High Water Consumption',
                message: `Hi ${req.user.firstName},\n\nYour weekly water consumption has reached ${totalLiters}L, which is higher than the recommended limit of 5000L.\n\nConsider checking our "Save Water" section for tips on reducing consumption.\n\nEco Regards,\nAquaSmart Team`,
            }).catch(err => console.error('High usage email failed:', err.message));
    }

    res.status(201).json({ 
        ...createdUsage._doc, 
        leakAlert, 
        highUsageAlert,
        billGenerated: true 
    });
};

// @desc    Get user water usage history
// @route   GET /api/usage
// @access  Private
const getUsageHistory = async (req, res) => {
    const usage = await WaterUsage.find({ user: req.user._id }).sort({ weekStarting: -1 });
    res.json(usage);
};

// @desc    Get latest usage for comparison
// @route   GET /api/usage/latest
// @access  Private
const getLatestUsage = async (req, res) => {
    const usage = await WaterUsage.findOne({ user: req.user._id }).sort({ weekStarting: -1 });
    
    if (usage) {
        const suggestions = getSuggestions(usage.categories, usage.numPeople);
        res.json({ ...usage._doc, suggestions });
    } else {
        res.json(null);
    }
};

module.exports = {
    addWaterUsage,
    getUsageHistory,
    getLatestUsage
};
