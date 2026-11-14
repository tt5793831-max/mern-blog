const Post = require('../models/postModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const HttpError = require('../models/errorModel');

// =================== CREATE A POST
// POST : /api/posts
// PROTECTED
const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;
        
        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose thumbnail.", 422));
        }

        const { thumbnail } = req.files; // req.files ထဲမှ thumbnail ကို ထုတ်ယူရန်

        // Check the file size (less than 2MB)
        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail too big. File should be less than 2mb.", 422));
        }

        let fileName = thumbnail.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];

        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err, 500));
            } else {
                const newPost = await Post.create({
                    title,
                    category,
                    description,
                    thumbnail: newFilename,
                    creator: req.user.id
                });

                if (!newPost) {
                    return next(new HttpError("Post couldn't be created.", 422));
                }

                // Find user and increase post count by 1
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

                res.status(201).json(newPost);
            }
        });

    } catch (error) {
        return next(new HttpError(error, 500));
    }
};

// =================== GET ALL POSTS
// GET : /api/posts
// UNPROTECTED
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error, 500));
    }
};
// =================== GET SINGLE POST
// GET : /api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }
        
        res.status(200).json(post);
        
    } catch (error) {
        return next(new HttpError(error, 500));
    }
};

// =================== GET POSTS BY CATEGORY
// GET : /api/posts/categories/:category
// UNPROTECTED
// UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
        
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError(error, 500));
    }
};
// =================== GET USER/AUTHOR POSTS
// GET : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error, 500));
    }
};

// =================== EDIT POST
// PATCH : /api/posts/:id
// PROTECTED
// PROTECTED
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFilename;
        let updatedPost;
        const postId = req.params.id;
        let { title, category, description } = req.body;

        // Check if all fields are filled and description length is valid
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        // Get old post from database to check creator / old thumbnail
        const oldPost = await Post.findById(postId);
        if (req.user.id != oldPost.creator) {
            return next(new HttpError("Unauthorized", 403));
        }

        if (!req.files) {
            // Update without changing thumbnail
            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
        } else {
            // 1. Delete old thumbnail from uploads folder
            fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                if (err) {
                    return next(new HttpError(err, 500));
                }
            });

            // 2. Upload new thumbnail
            const { thumbnail } = req.files;
            
            // Check file size (less than 2MB)
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail too big. Should be less than 2mb.", 422));
            }

            fileName = thumbnail.name;
            let splittedFilename = fileName.split('.');
            newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];
            
            thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
                if (err) {
                    return next(new HttpError(err, 500));
                }
            });

            // 3. Update post with new thumbnail
            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFilename }, { new: true });
        }

        if (!updatedPost) {
            return next(new HttpError("Post couldn't be updated.", 422));
        }

        res.status(200).json(updatedPost);

    } catch (error) {
        return next(new HttpError(error, 500));
    }
};

// =================== DELETE POST
// DELETE : /api/posts/:id
// PROTECTED
// PROTECTED
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post unavailable.", 400));
        }

        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }

        // Check if the user is the creator of the post
        if (req.user.id != post.creator) {
            return next(new HttpError("Unauthorized", 403));
        }

        const fileName = post.thumbnail;

        // Delete thumbnail from uploads folder
        fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
            if (err) {
                return next(new HttpError(err, 500));
            } else {
                // Delete post from database
                await Post.findByIdAndUpdate(postId); // (သို့မဟုတ် findByIdAndDelete)
                
                // Find user and reduce post count by 1
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser?.posts - 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

                res.status(200).json({ message: `Post ${postId} deleted successfully.` });
            }
        });

    } catch (error) {
        return next(new HttpError(error, 500));
    }
};
module.exports = { 
    createPost, 
    getPosts, 
    getPost, 
    getCatPosts, 
    getUserPosts, 
    editPost, 
    deletePost 
};