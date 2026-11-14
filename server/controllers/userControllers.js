const bcrypt = require('bcryptjs');
const jwt=require("jsonwebtoken"); 
const fs=require('fs');
const path=require('path');
const { v4: uuid } = require('uuid');
const User = require("../models/userModel");
const HttpError = require("../models/errorModel");

// =================== REGISTER A NEW USER
// POST : /api/users/register
// UNPROTECTED
const registerUser = async (req, res, next) => {
    try {
        console.log("Request Body Received:", req.body);
        const { name, email, password, password2 } = req.body;
        
        if (!name || !email || !password || !password2) {
            return next(new HttpError("Fill in all fields.", 422));
        }
        
        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({ email: newEmail });
        
        if (emailExists) {
            return next(new HttpError("Email already exists", 422));
        }

        if (password.trim().length < 6) {
            return next(new HttpError("Password should be at least 6 characters.", 422));
        }

        if (password !== password2) {
            return next(new HttpError("Passwords do not match.", 422));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = await User.create({ 
            name, 
            email: newEmail, 
            password: hashedPass 
        });

        res.status(201).json(`New user ${newUser.email} registered successfully.`);

    } catch (error) {
        console.error("EXACT ERROR IS:", error);
        return next(new HttpError(error.message || "User registration failed.", 422));
    }
};

// =================== LOGIN A REGISTERED USER
// POST : /api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
    try {
    const {email, password} = req.body;
    if(!email || !password) {
        return next(new HttpError("Fill in all fields.", 422))
    }
    const newEmail = email.toLowerCase();

    const user = await User.findOne({email: newEmail})
    if(!user) {
        return next(new HttpError("Invalid credentials.", 422))
    }

    const comparePass = await bcrypt.compare(password, user.password)
    if(!comparePass) {
        return next(new HttpError("Invalid credentials.", 422))
    }

   const {_id: id, name} = user;
const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

res.status(200).json({token, id, name})
    
} catch (error) {
    return next(new HttpError("Login failed. Please check your credentials.", 422))
}
};

// =================== USER PROFILE
// GET : /api/users/:id
// UNPROTECTED
const getUser = async (req, res, next) => {
    try {
    const {id} = req.params;
    const user = await User.findById(id).select('-password');
    if(!user) {
        return next(new HttpError("User not found.", 404))
    }
    res.status(200).json(user);
} catch (error) {
    return next(new HttpError(error))
}

};

// =================== CHANGE USER AVATAR (profile picture)
// POST : /api/users/change-avatar
// UNPROTECTED
const changeAvatar = async (req, res, next) => {
  try {
    // ၁။ ဖိုင်ပါ မပါ အရင်စစ်ပါ
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please choose an image.", 422));
    }

    const { avatar } = req.files;

    
    if (avatar.size > 500000) {
      return next(new HttpError("Profile picture too big. Should be less than 500kb", 422));
    }

    const user = await User.findById(req.user.id);

    if (user.avatar) {
      fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
        if (err) {
          return next(new HttpError(err));
        }
      });
    }


    let fileName;
fileName = avatar.name;
let splittedFilename = fileName.split('.')
let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length - 1]
avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
    if(err) {
        return next(new HttpError(err))
    }

    const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFilename}, {new: true})
    if(!updatedAvatar) {
        return next(new HttpError("Avatar couldn't be changed.", 422))
    }
    res.status(200).json(updatedAvatar)
})
    

  } catch (error) {
    return next(new HttpError(error));
  }
};

// =================== EDIT USER DETAILS (from profile)
// PATCH : /api/users/edit-user
// UNPROTECTED
// =================== EDIT USER DETAILS (from profile)
// PATCH : /api/users/edit-user
// PROTECTED
const editUser = async (req, res, next) => {
    try {
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
        
        // Check if required fields are filled
        if (!name || !email || !currentPassword || !newPassword) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        // Get user from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new HttpError("User not found.", 403));
        }

        // Make sure new email doesn't already exist
        const emailExist = await User.findOne({ email });
        // We want to update other details with/without changing the email (which is a unique id because we use it to login).
        if (emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Email already exist.", 422));
        }

        // Compare current password to db password
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validateUserPassword) {
            return next(new HttpError("Invalid current password", 422));
        }

        // Compare new passwords
        if (newPassword !== confirmNewPassword) {
            return next(new HttpError("New passwords do not match.", 422));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Update user info in database
        const newInfo = await User.findByIdAndUpdate(req.user.id, { name, email, password: hash }, { new: true });
        res.status(200).json(newInfo);

    } catch (error) {
        return next(new HttpError(error));
    }
};

// =================== GET AUTHORS
// GET : /api/users
// UNPROTECTED
const getAuthors = async (req, res, next) => {
    try {
    const authors = await User.find().select('-password');
    res.json(authors);
} catch (error) {
    return next(new HttpError(error))
}

};

module.exports = { registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors };