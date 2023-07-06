const moment = require('moment');
const User = require('../models/user');
const Visitor = require('../models/visitor');
const { getIO } = require('../utils/socket');


exports.getAllVisitors = async (req, res) => {
  try {
    const selectedDate = req.query.selectedDate;
    const visitors = await Visitor.find({ arrivalDate: selectedDate }).lean().sort({ createdAt: -1 });

    const userId = req.cookies.userId;
    const authenticated = req.cookies.authenticated;
    
    if (req.xhr) {
      res.json({ visitors });
    } else {
      if (userId && authenticated) {
        const user = await User.findById(userId);
        res.render('index', { user: user.username });
      }
      else {
        res.render('index');
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};


exports.deleteVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;
    await Visitor.findByIdAndRemove(visitorId);

    const selectedDate = req.query.selectedDate;

    getIO().emit('visitorDeleted', visitorId);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


exports.updateVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;
    const updatedData = req.body;

    const updatedDataWithTimestamp = {
      ...updatedData,
      updatedAt: moment().format('YYYY-MM-DD, HH:mm:ss')
    };

    await Visitor.findByIdAndUpdate(visitorId, { $set: updatedDataWithTimestamp });

    const selectedDate = req.query.selectedDate;

    getIO().emit('visitorUpdated', updatedData);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


exports.createVisitor = async (req, res) => {
  try {
    const visitorData = req.body;
    const selectedDate = visitorData.arrivalDate;

    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');

    const newVisitorData = {
      ...visitorData,
      arrivalDate: selectedDate,
      createdAt: `${currentDate}, ${currentTime}`,
      updatedAt: `${currentDate}, ${currentTime}`,
      user: req.cookies.userId
    };

    const newVisitor = await Visitor.create(newVisitorData);
 
    getIO().emit('visitorAdded', newVisitor);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};