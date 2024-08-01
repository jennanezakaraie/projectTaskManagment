const express  = require("express");
const taskRouter  = express.Router();
taskRouter.use(express.json());
const {createTask,updateTask,getAllTasks,removeTask,getOneTask,downloadFile,deleteFile,inviteUser,getMyTasks,
  getInviterTasks} =require('../controller/TaskController');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

taskRouter.post('/addTask',upload.single('file'),createTask);
// taskRouter.get('/allTasks/:userID',getAllTasks);
taskRouter.put('/updateTask/:taskID',upload.single('file'),updateTask);
taskRouter.delete('/deletTask/:taskID',removeTask);
taskRouter.get('/oneTask/:taskID',getOneTask);
taskRouter.get('/download/:id',upload.single('file'),downloadFile);
taskRouter.put('/deleteFile/:taskID',deleteFile);
taskRouter.post('/inviteUser/:userp',inviteUser);
taskRouter.get('/myTasks/:userID',getMyTasks);
taskRouter.get('/inviterTasks/:userID',getInviterTasks);
module.exports = taskRouter;  
