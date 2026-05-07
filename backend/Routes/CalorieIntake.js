const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const errorHandler = require('../Middlewares/errorMiddleware');
const request = require('request');
const User = require('../Models/UserSchema');
require('dotenv').config();


function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}


router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for calorie intake report'));
});

router.post('/addcalorieintake', authTokenHandler, async (req, res) => {
    const { item, date, quantity, quantitytype } = req.body;
    if (!item || !date || !quantity || !quantitytype) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }

    // Validate quantity is a valid number
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json(createResponse(false, 'Please provide a valid positive quantity'));
    }

    let qtyingrams = 0;
    if (quantitytype === 'g') {
        qtyingrams = parsedQuantity;
    }
    else if (quantitytype === 'kg') {
        qtyingrams = parsedQuantity * 1000;
    }
    else if (quantitytype === 'ml') {
        qtyingrams = parsedQuantity;
    }
    else if (quantitytype === 'l') {
        qtyingrams = parsedQuantity * 1000;
    }
    else {
        return res.status(400).json(createResponse(false, 'Invalid quantity type'));
    }

    const FALLBACK_CALORIES = {
        'rice': 130, 'chicken': 239, 'egg': 155, 'bread': 265, 'milk': 42,
        'banana': 89, 'apple': 52, 'potato': 77, 'pasta': 131, 'beef': 250,
        'fish': 206, 'cheese': 402, 'yogurt': 59, 'oats': 389, 'butter': 717,
        'sugar': 387, 'oil': 884, 'chocolate': 546, 'pizza': 266, 'burger': 295,
        'salad': 20, 'soup': 30, 'noodles': 138, 'corn': 86, 'beans': 347,
        'lentils': 116, 'tofu': 76, 'shrimp': 99, 'salmon': 208, 'tuna': 132,
        'pork': 242, 'lamb': 294, 'turkey': 189, 'duck': 337, 'bacon': 541,
        'sausage': 301, 'ham': 145, 'steak': 271, 'lobster': 89, 'crab': 97,
        'orange': 47, 'mango': 60, 'grape': 69, 'strawberry': 32, 'watermelon': 30,
        'pineapple': 50, 'peach': 39, 'pear': 57, 'cherry': 63, 'blueberry': 57,
        'avocado': 160, 'coconut': 354, 'almond': 579, 'peanut': 567, 'walnut': 654,
        'carrot': 41, 'broccoli': 34, 'spinach': 23, 'tomato': 18, 'onion': 40,
        'garlic': 149, 'pepper': 20, 'cucumber': 16, 'cabbage': 25, 'mushroom': 22,
        'coffee': 2, 'tea': 1, 'juice': 45, 'soda': 41, 'beer': 43, 'wine': 83,
        'cake': 257, 'cookie': 488, 'ice cream': 207, 'donut': 452, 'pancake': 227,
        'waffle': 291, 'cereal': 379, 'granola': 471, 'honey': 304, 'jam': 250,
    };

    async function saveCalorieEntry(caloriesPer100g, userId) {
        // Validate caloriesPer100g is a valid positive number
        if (isNaN(caloriesPer100g) || caloriesPer100g <= 0) {
            throw new Error('Invalid calorie data');
        }
        let calorieIntake = (caloriesPer100g / 100) * qtyingrams;
        const user = await User.findOne({ _id: userId });
        user.calorieIntake.push({
            item,
            date: new Date(date),
            quantity: parsedQuantity,
            quantitytype,
            calorieIntake: Math.round(calorieIntake)
        });
        await user.save();
        return calorieIntake;
    }

    var query = item;
    request.get({
        url: 'https://api.api-ninjas.com/v1/nutrition?query=' + query,
        headers: {
            'X-Api-Key': process.env.NUTRITION_API_KEY,
        },
    }, async function (error, response, body) {
        try {
            if (!error && response.statusCode === 200) {
                body = JSON.parse(body);
                if (body && body.length > 0 && typeof body[0].calories === 'number') {
                    let caloriesPer100g = (body[0].calories / body[0].serving_size_g) * 100;
                    if (!isNaN(caloriesPer100g) && caloriesPer100g > 0) {
                        let cal = await saveCalorieEntry(caloriesPer100g, req.userId);
                        return res.json(createResponse(true, `Calorie intake added (${parseInt(cal)} cal from API)`));
                    }
                }
            }

            const itemLower = item.toLowerCase().trim();
            let matched = FALLBACK_CALORIES[itemLower];
            if (!matched) {
                for (const [key, val] of Object.entries(FALLBACK_CALORIES)) {
                    if (itemLower.includes(key) || key.includes(itemLower)) {
                        matched = val;
                        break;
                    }
                }
            }

            if (matched) {
                let cal = await saveCalorieEntry(matched, req.userId);
                return res.json(createResponse(true, `Calorie intake added (${parseInt(cal)} cal estimated)`));
            }

            let cal = await saveCalorieEntry(100, req.userId);
            return res.json(createResponse(true, `Calorie intake added (${parseInt(cal)} cal, default estimate)`));
        } catch (err) {
            return res.status(500).json(createResponse(false, 'Failed to save calorie intake: ' + err.message));
        }
    });

})
router.post('/getcalorieintakebydate', authTokenHandler, async (req, res) => {
    const { date } = req.body;
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    if (!date) {
        let date = new Date();   
        user.calorieIntake = filterEntriesByDate(user.calorieIntake, date);

        return res.json(createResponse(true, 'Calorie intake for today', user.calorieIntake));
    }
    user.calorieIntake = filterEntriesByDate(user.calorieIntake, new Date(date));
    res.json(createResponse(true, 'Calorie intake for the date', user.calorieIntake));

})
router.post('/getcalorieintakebylimit', authTokenHandler, async (req, res) => {
    const { limit } = req.body;
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'Calorie intake', user.calorieIntake));
    }
    else {


        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();
        // 1678910

        user.calorieIntake = user.calorieIntake.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })


        return res.json(createResponse(true, `Calorie intake for the last ${limit} days`, user.calorieIntake));


    }
})
router.delete('/deletecalorieintake', authTokenHandler, async (req, res) => {
    const { item, date } = req.body;
    if (!item || !date) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.calorieIntake = user.calorieIntake.filter((entry) => {
        return !(entry.item === item && new Date(entry.date).toISOString() === new Date(date).toISOString());
    })
    await user.save();
    res.json(createResponse(true, 'Calorie intake deleted successfully'));

})
router.get('/getgoalcalorieintake', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    let gender = user.gender;
    if (gender == 'male') {
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age)

    }
    else if (gender == 'female') {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)

    }
    else {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)
    }
    if (user.goal == 'weightLoss') {
        maxCalorieIntake = BMR - 500;
    }
    else if (user.goal == 'weightGain') {
        maxCalorieIntake = BMR + 500;
    }
    else {
        maxCalorieIntake = BMR;
    }

    res.json(createResponse(true, 'max calorie intake', { maxCalorieIntake }));

})


function filterEntriesByDate(entries, targetDate) {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
            entryDate.getDate() === targetDate.getDate() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getFullYear() === targetDate.getFullYear()
        );
    });
}
module.exports = router;
