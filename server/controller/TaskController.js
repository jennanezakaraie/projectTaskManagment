
const { ObjectId } = require('mongodb');
const TaskModel = require('../model/SchemaTask');
const User = require("../model/SchemaUser");
const fs = require('fs');
const asyncHandle = require("express-async-handler");
const path = require('path');
const Notification = require('../model/notification');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Invitation = require("../model/invitationSchema");
const pusher = require('../pusher'); 
const createTask = asyncHandle(async (req, res) => {
  try {
    const { title, description, dueDate, user } = req.body;
    let fileData = null;

    if (req.file) {
      fileData = {
        filename: req.file.filename,
        path: req.file.path,
        originalname: req.file.originalname,
      };
    }

 
    const newTask = new TaskModel({
      title,
      description,
      dueDate,
      user: new ObjectId(user),
      file: fileData,
    });

    const userDoc = await User.findOne({ _id: new ObjectId(user) });
    const notificationMessage = `The task "${newTask.title}" of "${userDoc.name}" is add in date ${newTask.dueDate} `;
    notifyUsers(newTask,notificationMessage);
    await newTask.save();

   
    res.status(201).json(newTask);
  } catch (error) {
    
    console.error('Error creating task:', error);
    res.status(500).json({
      status: 'Fail',
      message: 'Task creation failed',
      error: error.message,
    });
  }
});

const updateTask = asyncHandle(async (req, res) => {
  const { taskID } = req.params;
  
  try {  
    const task = await TaskModel.findById(taskID);
   
 


  
    if (!task) {
      return res.status(404).send('Task not found');
    }

    // Handle file update
    if (req.file) {
      // Remove existing file if present
      if (task.file && task.file.path) {
        const absolutePath = 'C:\\Users\\Zakaraie jennane\\projectToDoList\\server'; // Ensure this path is correct
        const filePath = path.join(absolutePath, task.file.path);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Update task with new file details
      task.file = {
        filename: req.file.filename,
        path: req.file.path,
        originalname: req.file.originalname,
      };
    }

    // Update other task fields from request body
    task.title = req.body.title;
    task.description = req.body.description;
    task.dueDate = req.body.dueDate;
    task.completed = Boolean(req.body.completed); // Ensure boolean conversion

    const updatedTask = await task.save();
    const userDoc = await User.findOne({ _id: new ObjectId(task.user) });
    const notificationMessage = `The task "${task.title}" of "${userDoc.name}" is updated  in date ${task.dueDate}`;
    notifyUsers(task,notificationMessage);


    res.status(200).json({
      status: 'Success',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Server error');
  }
});


const removeTask = asyncHandle(async (req, res) => {
  const { taskID } = req.params;

  const task = await TaskModel.findOneAndDelete({ _id: taskID });
  if (!task) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Task not found or not associated with the user',
    });
  }

  if (task.file && task.file.path) {
    const absolutePath = 'C:\\Users\\Zakaraie jennane\\projectToDoList\\server'; // Ensure this path is correct
    const filePath = path.join(absolutePath, task.file.path);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  const userDoc = await User.findOne({ _id: new ObjectId(task.user) });
  const notificationMessage = `The task "${task.title}" of "${userDoc.name}" is delete  in date ${task.dueDate}`;
  notifyUsers(task,notificationMessage);

  
  res.status(200).json({
    status: 'Success',
    message: 'Task removed successfully',
  });
});

const deleteFile= asyncHandle(async (req, res) => {
  const { taskID } = req.params;
  
  try {
    const task = await TaskModel.findById(taskID);

    if (!task) {
      return res.status(404).json({ status: 'Fail', message: 'Task not found' });
    }

    // If the task has a file, delete it from the filesystem
    if (task.file && task.file.path) {
      const absolutePath = 'C:\\Users\\Zakaraie jennane\\projectToDoList\\server'; 
      const filePath = path.join(absolutePath, task.file.path);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update the task in the database to set file field to null
      await TaskModel.findByIdAndUpdate(taskID, { file: null }, { new: true });

      const userDoc = await User.findOne({ _id: new ObjectId(task.user) });
      const notificationMessage = `The task "${task.title}" of "${userDoc.name}" is delete File in date ${task.dueDate}`;
      notifyUsers(task,notificationMessage);

      res.status(200).json({ status: 'Success', message: 'Task file removed successfully' });
    }else{
      res.status(404).json({
        status:'failed',
        message:'Task no have file'
      })
    }

   
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ status: 'Fail', message: 'Server error', error: error.message });
  }
});



// const getAllTasks = async (req, res) => {
//   try {
//     const userID = req.params.userID;

//     // Fetch all inviters for the given invitee
//     const invitations = await Invitation.find({ inviteeID: userID });
//     const inviterIDs = invitations.map(invitation => invitation.inviterID);

//     // Fetch tasks for both the invitee and inviters
//     const userTasks = await TaskModel.find({ user: userID });
//     const inviterTasks = await TaskModel.find({ user: { $in: inviterIDs } });

//     // Combine tasks
//     let tasks = [...userTasks, ...inviterTasks];

//     // Sort tasks
//     const sortField = req.query.sortField || 'createdAt';
//     const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
//     tasks = tasks.sort((a, b) => (a[sortField] > b[sortField] ? sortOrder : -sortOrder));

//     // Pagination
//     const currentPage = parseInt(req.query.currentPage) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 3;
//     const totalTasks = tasks.length;
//     const startIndex = (currentPage - 1) * pageSize;
//     const paginatedTasks = tasks.slice(startIndex, startIndex + pageSize);

//     // Enrich tasks with user details
//     const enrichedTasks = await Promise.all(paginatedTasks.map(async (task) => {
//       const userDetails = await User.findById(task.user).select('name email'); // Assuming UserModel exists and has 'name' and 'email' fields
//       return {
//         ...task.toObject(),
//         userDetails
//       };
//     }));  

//     res.json({ data: enrichedTasks, totalTasks });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// };



const fetchTasks = async (userID, sortField, sortOrder, currentPage, pageSize, includeInviterTasks) => {
  try {
    let matchCondition = { user: new ObjectId(userID) };

    if (includeInviterTasks) {
      const invitations = await Invitation.find({ inviteeID: userID });
      const inviterIDs = invitations.map(invitation => new ObjectId(invitation.inviterID));
      matchCondition = { user: { $in: inviterIDs } };
    }

    const skip = (currentPage - 1) * pageSize;
    const sort = { [sortField]: sortOrder };

    const tasks = await TaskModel.aggregate([
      { $match: matchCondition },
      { $sort: sort },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      { $project: { 'userDetails.password': 0 } } // Assuming you want to exclude the password field
    ]);

    const totalTasks = await TaskModel.countDocuments(matchCondition);

    return { enrichedTasks: tasks, totalTasks };
  } catch (error) {
    throw new Error('Failed to fetch tasks');
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userID = req.params.userID;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const currentPage = parseInt(req.query.currentPage) || 1;
    const pageSize = parseInt(req.query.pageSize) || 3;

    const { enrichedTasks, totalTasks } = await fetchTasks(userID, sortField, sortOrder, currentPage, pageSize, false);

    res.json({ data: enrichedTasks, totalTasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getInviterTasks = async (req, res) => {
  try {
    const userID = req.params.userID;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const currentPage = parseInt(req.query.currentPage) || 1;
    const pageSize = parseInt(req.query.pageSize) || 3;

    const { enrichedTasks, totalTasks } = await fetchTasks(userID, sortField, sortOrder, currentPage, pageSize, true);

    res.json({ data: enrichedTasks, totalTasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};



const getOneTask = asyncHandle(async (req, res) => {
  const { taskID } = req.params;
 
  if (!ObjectId.isValid(taskID)) {
    return res.status(400).json({
      status: 'Fail',
      message: 'Invalid task ID',
    });
  }
  const task = await TaskModel.findOne({ _id: taskID });
  if (!task) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Task not found or not associated with the user',
    });
  }

  res.status(200).json({
    status: 'Success',
    message: 'bring Task  successfully',
    data : task
  });
});

const downloadFile = asyncHandle(async (req,res)=>{
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task || !task.file || !task.file.path) {
      return res.status(404).send('File not found');
    }
  
    const absolutePath = 'C:\\Users\\Zakaraie jennane\\projectToDoList\\server'; 
    const filePath = path.join(absolutePath, task.file.path);
    console.log(filePath); 
    
    res.download(filePath, task.file.originalname);
  } catch (error) {
    res.status(500).send('Error occurred');
  }
})







 //invite anybody
 const inviteUser = asyncHandle(async (req, res) => {  
  const { email } = req.body; 
  const { userp } = req.params;

  try {
    // Find the user by email
    let user = await User.findOne({ email: email });
   
    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (!user) {
      // If the user doesn't exist, send a sign-up invitation
      const signUpMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Task Collaboration Invitation',
        html: `<p>You have been invited to collaborate on tasks.</p>
               <p>Click this <a href="http://localhost:4200/signUp?email=${email}&userp=${userp}">link</a> to sign up and start collaborating.</p>`,
      };

      await transporter.sendMail(signUpMailOptions);
    } else {
  
      // If the user exists, create a new invitation
      const newInvitation = new Invitation({
        inviterID:new ObjectId(userp) ,
        inviteeID: new ObjectId(user._id)  // Ensure inviteeID is an ObjectId if it's stored as such in MongoDB
      });
      await newInvitation.save();

      const signInMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Task Collaboration Invitation',
        html: `<p>You have been invited to collaborate on tasks.</p>
               <p>Click this <a href="http://localhost:4200/signIn?email=${email}&inviterUserID=${user._id}">link</a> to sign in and start collaborating.</p>`,
      };

      await transporter.sendMail(signInMailOptions);
    }

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


const notifyUsers = async (task, notificationMessage) => {
  try {
    const v = await Invitation.find({
      inviteeID: task.user
    });

    const v2 = await Invitation.find({
      inviterID: task.user
    });

    const inviterIDs = [...new Set(v2.map(invitation => invitation.inviterID.toString()))];
    const inviteeIDs = [...new Set(v.map(invitation => invitation.inviteeID.toString()))];

    const findInInviter = await TaskModel.findOne({ user: { $in: inviterIDs } });

    if (findInInviter) {
      console.log("inviterIDs: ", inviterIDs);
      // Notify all inviters
      for (const element of inviterIDs) {
        const notification = new Notification({
          userId: element,
          message: notificationMessage,
          date: new Date(),
          read: false
        });
        await notification.save();
        pusher.trigger('notifications', 'new-notification', {
          message: notificationMessage
        });
      }
    } else {
      console.log("inviteeIDs: ", inviteeIDs);
      // Notify all invitees
      for (const element of inviteeIDs) {
        const notification = new Notification({
          userId: element,
          message: notificationMessage,
          date: new Date(),
          read: false
        });
        await notification.save();
        pusher.trigger('notifications', 'new-notification', {
          message: notificationMessage
        });
      }
    }
  } catch (error) {
    console.error('Error notifying users:', error);
  }
};

module.exports = {
  createTask, 
  removeTask,
  updateTask,
  // getAllTasks,
  getOneTask,
  downloadFile,
  deleteFile,
  inviteUser,
  getMyTasks,
  getInviterTasks
};
