const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
const { sendSMS } = require("../utils/sms")
const { checkEmpty } = require("../utils/checkEmpty")
const Posts = require("../models/Posts")
const upload = require("../utils/upload")
const cloudinary = require("../utils/cloudinary.config")

exports.verifyUserEmail = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You are not Logged In. Please Login Again" })
    }
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailcode: otp })

    const isSend = await sendEmail({
        to: result.email,
        subject: "Verify Email",
        message: `<p>your otp ${otp}</p>`
    })

    res.json({ message: "Verification Send Success" })
})
exports.verifyEmailOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You are not Logged In. Please Login Again" })
    }
    console.log(result);
    console.log(req.body);
    if (otp != result.emailcode) {
        return res.status(400).json({ message: "Invalid OTP" })
    }
    await User.findByIdAndUpdate(req.loggedInUser, { emailVerified: true })
    res.json({ message: "Email Verify  Success" })
})
exports.verifyUserMobile = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(1000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { mobilecode: otp })
    await sendSMS({
        message: ` welcome to SKILLHUB. Your OTP is ${otp}`,
        numbers: `${result.mobile}`
    })
    res.json({ message: "Verification Send  Success" })
})
exports.verifyMobileOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You are not Logged In. Please Login Again" })
    }
    if (otp !== result.mobilecode) {
        return res.status(400).json({ message: "Invalid OTP" })
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.loggedInUser,
        { mobileVerified: true },
        { new: true }
    )
    res.json({
        message: "Mobile Verify  Success", result: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            avatar: updatedUser.avatar,
            emailVerified: updatedUser.emailVerified,
            mobileVerified: updatedUser.mobileVerified,
        }
    })
})
exports.getLocation = asyncHandler(async (req, res) => {
    const { gps } = req.body
    const { isError, error } = checkEmpty({ gps })
    if (isError) {
        return res.status(400).json({ message: "All Fields Required", error })
    }

    //api call to openCageData
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPEN_CAGE_API_KEY}f&q=${gps.latitude}%2C${gps.longitude}&pretty=1&no_annotations=1`)

    const x = await response.json()

    res.json({ message: "Location fetch Success", result: x.results[0].formatted })

})
exports.addPost = asyncHandler(async (req, res) => {
    upload(req, res, async err => {

        const { category, title, desc, price, location } = req.body
        const { error, isError } = checkEmpty({ title, desc, price, location, category })
        if (isError) {
            return res.status(400).json({ message: "All Fields Required", error })
        }

        console.log(req.files)
        const images = []
        for (const item of req.files) {
            const { secure_url } = await cloudinary.uploader.upload(item.path)
            images.push(secure_url)
        }

        // modify this code to support cloudnary
        await Posts.create({
            title,
            category,
            desc, price,
            images,
            location,
            user: req.loggedInUser
        })
        res.json({ message: "Post create success" })
    })
})
exports.getAllPosts = asyncHandler(async (req, res) => {
    const result = await Posts.find()
    res.json({ message: "post fetch success", result })
})
