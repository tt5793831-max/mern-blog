
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')
const User = require('../models/userModel')
const HttpError = require('../models/errorModel')

// =================== REGISTER A NEW USER
// POST: /api/users/register
// UNPROTECTED
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, password2 } = req.body

        if (!name || !email || !password || !password2) {
            return next(new HttpError('Fill in all fields.', 422))
        }

        const newEmail = email.trim().toLowerCase()

        const emailExists = await User.findOne({ email: newEmail })

        if (emailExists) {
            return next(new HttpError('Email already exists.', 422))
        }

        if (password.trim().length < 6) {
            return next(new HttpError('Password should be at least 6 characters.', 422))
        }

        if (password !== password2) {
            return next(new HttpError('Passwords do not match.', 422))
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            name: name.trim(),
            email: newEmail,
            password: hashedPass
        })

        res.status(201).json(
            `New user ${newUser.email} registered successfully.`
        )

    } catch (error) {
        console.error('Registration error:', error)
        return next(new HttpError(error.message || 'User registration failed.', 422))
    }
}

// =================== LOGIN A REGISTERED USER
// POST: /api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new HttpError('Fill in all fields.', 422))
        }

        const newEmail = email.trim().toLowerCase()

        const user = await User.findOne({ email: newEmail })

        if (!user) {
            return next(new HttpError('Invalid credentials.', 422))
        }

        const comparePass = await bcrypt.compare(password, user.password)

        if (!comparePass) {
            return next(new HttpError('Invalid credentials.', 422))
        }

        const { _id: id, name } = user

        const token = jwt.sign(
            { id, name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(200).json({ token, id, name })

    } catch (error) {
        return next(new HttpError('Login failed. Please check your credentials.', 422))
    }
}

// =================== USER PROFILE
// GET: /api/users/:id
// UNPROTECTED
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params

        const user = await User.findById(id).select('-password')

        if (!user) {
            return next(new HttpError('User not found.', 404))
        }

        res.status(200).json(user)

    } catch (error) {
        return next(new HttpError(error.message || 'Could not load profile.', 422))
    }
}

// =================== CHANGE USER AVATAR
// POST: /api/users/change-avatar
// PROTECTED
const changeAvatar = async (req, res, next) => {
    try {
        if (!req.files || !req.files.avatar) {
            return next(new HttpError('Please choose an image.', 422))
        }

        const { avatar } = req.files

        if (avatar.size > 500000) {
            return next(new HttpError('Profile picture must be less than 500KB.', 422))
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            return next(new HttpError('User not found.', 404))
        }

        const uploadPath = path.join(__dirname, '..', 'uploads')

        if (user.avatar) {
            const oldAvatarPath = path.join(uploadPath, user.avatar)

            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath)
            }
        }

        const fileName = avatar.name
        const splittedFilename = fileName.split('.')
        const extension = splittedFilename.pop()
        const newFilename = `${splittedFilename.join('.')}${uuid()}.${extension}`

        avatar.mv(path.join(uploadPath, newFilename), async (err) => {
            if (err) {
                return next(new HttpError('Image upload failed.', 422))
            }

            try {
                const updatedAvatar = await User.findByIdAndUpdate(
                    req.user.id,
                    { avatar: newFilename },
                    { new: true }
                ).select('-password')

                if (!updatedAvatar) {
                    return next(new HttpError("Avatar couldn't be changed.", 422))
                }

                res.status(200).json(updatedAvatar)

            } catch (error) {
                return next(new HttpError(error.message, 422))
            }
        })

    } catch (error) {
        return next(new HttpError(error.message, 422))
    }
}

// =================== EDIT USER DETAILS
// PATCH: /api/users/edit-user
// PROTECTED
const editUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            currentPassword,
            newPassword,
            confirmNewPassword
        } = req.body

        if (!name?.trim() || !email?.trim()) {
            return next(new HttpError('Name and email are required.', 422))
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            return next(new HttpError('User not found.', 404))
        }

        const newEmail = email.trim().toLowerCase()

        const emailExist = await User.findOne({ email: newEmail })

        if (emailExist && emailExist._id.toString() !== req.user.id) {
            return next(new HttpError('Email already exists.', 422))
        }

        user.name = name.trim()
        user.email = newEmail

        // Change password only when a new password is provided
        if (newPassword) {
            if (!currentPassword) {
                return next(new HttpError('Enter your current password.', 422))
            }

            const validatePassword = await bcrypt.compare(
                currentPassword,
                user.password
            )

            if (!validatePassword) {
                return next(new HttpError('Invalid current password.', 422))
            }

            if (newPassword.length < 6) {
                return next(new HttpError('New password must be at least 6 characters.', 422))
            }

            if (newPassword !== confirmNewPassword) {
                return next(new HttpError('New passwords do not match.', 422))
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        await user.save()

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            posts: user.posts
        })

    } catch (error) {
        return next(new HttpError(error.message || 'Profile update failed.', 422))
    }
}

// =================== GET AUTHORS
// GET: /api/users
// UNPROTECTED
const getAuthors = async (req, res, next) => {
    try {
        const authors = await User.find().select('-password')
        res.status(200).json(authors)

    } catch (error) {
        return next(new HttpError(error.message || 'Could not get authors.', 422))
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    changeAvatar,
    editUser,
    getAuthors
}
