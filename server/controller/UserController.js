const User = require("../model/SchemaUser");
const { ObjectId } = require('mongodb');
const asyncHandle = require("express-async-handler");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Notification = require('../model/notification');
const pusher = require('../pusher'); 
const jwtSecret = "39f5e1dd61fe8294de674da4f4143e030bba4edb4c58d1e4306bfce0e33a09c0";
const Invitation = require("../model/invitationSchema");
const login = asyncHandle(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Email and password are required');
      return res.status(400).send('Email and password are required');
    }

    const foundUser = await User.findOne({ email: email });
    console.log('Found User:', foundUser);

    if (!foundUser) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (isPasswordValid) {
      const token = jwt.sign({ userId: foundUser._id }, jwtSecret, { expiresIn: '1h' });
      console.log(foundUser.role);
      
      if (foundUser.role === "admin") {
        const usersWithTasks = await User.aggregate([
          {
            $lookup: {
              from: 'tasks',
              localField: '_id',
              foreignField: 'user',
              as: 'tasks'
            }
          }
        ]);

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize current date

        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

        usersWithTasks.forEach(user => {
          user.tasks.forEach(async task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0); // Normalize due date

            const timeDifference = dueDate - currentDate;
            const dayDifference = Math.floor(timeDifference / oneDayInMilliseconds);

            if (dayDifference === 1) {
              const notificationMessage = `The task "${task.title}" of "${user.name}" is due in 1 day!`;
              const notification = new Notification({
                userId: user._id,
                message: notificationMessage,
                date: new Date(),
                read: false
              });

              try {
                await notification.save();
                pusher.trigger('notifications','new-notification', {
                  message: notificationMessage
                });
                console.log(`Notification sent to user ${user.name}`);
              } catch (err) {
                console.error('Error sending notification:', err);
              }
            }
          });
        });
      }

      res.status(200).json({
        token: token,
        user: foundUser
      });

      console.log('Password is valid');
    } else {
      console.log('Incorrect password');
      res.status(401).send('Incorrect password');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
});

const createUser = asyncHandle(async (req, res) => {
  try {
    console.log("req.body ", req.body);
    const newUser = await User.create(req.body);
   console.log('user new invitee ',newUser._id);
    console.log("userp  inviter",req.params.userp)

    if ((req.params.userp)) {
      const newInvitation = new Invitation({
        inviterID: new ObjectId(req.params.userp),
        inviteeID: new ObjectId(newUser._id) // Use newUser._id to get the newly created user's ID
      });
      await newInvitation.save();

      console.log("invitation createUser", newInvitation);
    }

    res.status(201).json({
      status: 'Success',
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      res.status(400).json({
        status: 'Fail',
        message: 'Validation error',
        errors: error.errors,
      });
    } else if (error.code === 11000) {
      res.status(400).json({
        status: 'Fail',
        message: 'Email already exists',
        code: 11000,
      });
    } else {
     
      res.status(500).json({
        status: 'Error',
        message: 'An internal server error occurred',
      });
    }
  }
});

const getOneUser = asyncHandle(async (req, res) => {
  try {
    const { name } = req.params;
    const foundUser = await User.find({ name: name });
    if (!foundUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      data: foundUser
    });
  } catch (error) {
    res.status().send('Server error');
  }
});

const getAllUsers = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.currentPage) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const totalUser = await User.countDocuments();
    const users = await User.find({})
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
      });
    }

    res.status(200).json({
      data: users,
      totalUser: totalUser
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = asyncHandle(async (req, res) => {
  try {
    const { userID } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not updated",
      });
    }

    res.status(200).json({
      status: 'Success',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

const deleteUser = asyncHandle(async (req, res) => {
  try {
    const { userID } = req.params;
    const result = await User.findByIdAndDelete(userID);

    if (!result) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const sendResetEmail = async (email) => {
  const token = crypto.randomBytes(20).toString('hex');
  const resetURL = `http://localhost:4200/reset-password?token=${token}&email=${email}`;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p>You requested a password reset</p>
           <p>Click this <a href="${resetURL}">link</a> to reset your password</p>`,
  };

  await transporter.sendMail(mailOptions);

  return token; 
};


const forgotPassword = asyncHandle(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = await sendResetEmail(user.email);
  
    res.status(200).json({ message: 'Password reset email sent', token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

const resetPassword = asyncHandle(async (req, res) => {
  const { token, email } = req.query; // Get the token and email from query parameters
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


  await User.updateOne( { email: email }, { $set: { password: hashedPassword } } ) 

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
});





module.exports = {
  login,
  createUser,
  getOneUser,
  getAllUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
 
};
