const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')
const HttpError = require('../models/errorModel')

const uploadDir = path.join(__dirname, '..', 'uploads')

// CREATE POST
const createPost = async (req, res, next) => {
    try {
        const { title, category, description } = req.body

        if (!title || !category || !description || !req.files?.thumbnail) {
            return next(new HttpError('Fill in all fields and choose thumbnail.', 422))
        }

        const { thumbnail } = req.files

        if (thumbnail.size > 2000000) {
            return next(new HttpError('Thumbnail too big. File should be less than 2mb.', 422))
        }

        const fileName = `${path.parse(thumbnail.name).name}-${uuid()}${path.extname(thumbnail.name)}`
        const filePath = path.join(uploadDir, fileName)

        await thumbnail.mv(filePath)

        try {
            const newPost = await Post.create({
                title,
                category,
                description,
                thumbnail: fileName,
                creator: req.user.id
            })

            await User.findByIdAndUpdate(
                req.user.id,
                { $inc: { posts: 1 } }
            )

            res.status(201).json(newPost)
        } catch (error) {
            await fs.promises.unlink(filePath).catch(() => {})
            throw error
        }

    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

// GET ALL POSTS
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 })

        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

// GET SINGLE POST
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id

        const post = await Post.findById(postId)

        if (!post) {
            return next(new HttpError('Post not found.', 404))
        }

        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

// GET POSTS BY CATEGORY
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params

        const catPosts = await Post.find({ category }).sort({ createdAt: -1 })

        res.status(200).json(catPosts)
    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

// GET POSTS BY USER
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params

        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 })

        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

// EDIT POST
const editPost = async (req, res, next) => {
    try {
        const postId = req.params.id
        const { title, category, description } = req.body

        if (!title || !category || !description || description.length < 12) {
            return next(new HttpError('Fill in all fields. Description must be at least 12 characters.', 422))
        }

        const oldPost = await Post.findById(postId)

        if (!oldPost) {
            return next(new HttpError('Post not found.', 404))
        }

        if (String(req.user.id) !== String(oldPost.creator)) {
            return next(new HttpError('Unauthorized', 403))
        }

        let updatedData = {
            title,
            category,
            description
        }

        let newFilePath = null

        if (req.files?.thumbnail) {
            const { thumbnail } = req.files

            if (thumbnail.size > 2000000) {
                return next(new HttpError('Thumbnail too big. Should be less than 2mb.', 422))
            }

            const newFilename = `${path.parse(thumbnail.name).name}-${uuid()}${path.extname(thumbnail.name)}`
            newFilePath = path.join(uploadDir, newFilename)

            await thumbnail.mv(newFilePath)

            updatedData.thumbnail = newFilename
        }

        let updatedPost

        try {
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                updatedData,
                { new: true, runValidators: true }
            )
        } catch (error) {
            if (newFilePath) {
                await fs.promises.unlink(newFilePath).catch(() => {})
            }
            throw error
        }

        if (!updatedPost) {
            return next(new HttpError("Post couldn't be updated.", 422))
        }

        if (newFilePath) {
            await fs.promises.unlink(
                path.join(uploadDir, oldPost.thumbnail)
            ).catch(() => {})
        }

        res.status(200).json(updatedPost)

    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

// DELETE POST
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id

        if (!postId) {
            return next(new HttpError('Post unavailable.', 400))
        }

        const post = await Post.findById(postId)

        if (!post) {
            return next(new HttpError('Post not found.', 404))
        }

        if (String(req.user.id) !== String(post.creator)) {
            return next(new HttpError('Unauthorized', 403))
        }

        // Delete post from database
        await Post.findByIdAndDelete(postId)

        // Delete thumbnail image
        await fs.promises.unlink(
            path.join(uploadDir, post.thumbnail)
        ).catch(() => {})

        // Update user's post count
        await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { posts: -1 } }
        )

        res.status(200).json({
            message: `Post ${postId} deleted successfully.`
        })

    } catch (error) {
        return next(new HttpError(error.message || error, 500))
    }
}

module.exports = {
    createPost,
    getPosts,
    getPost,
    getCatPosts,
    getUserPosts,
    editPost,
    deletePost
}

