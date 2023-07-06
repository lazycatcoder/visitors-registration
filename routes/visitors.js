const express = require('express');
const visitorsController = require('../controllers/visitorsController');
const requireAuth = require('../middleware/requireAuth');
const matchToken = require('../middleware/matchToken');
const router = express.Router();


router.get('/', matchToken, visitorsController.getAllVisitors);
router.delete('/:id', matchToken, requireAuth, visitorsController.deleteVisitor);
router.put('/:id', matchToken, requireAuth, visitorsController.updateVisitor);
router.post('/', matchToken, requireAuth, visitorsController.createVisitor);


module.exports = router;