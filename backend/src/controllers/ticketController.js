const TicketModel = require('../models/TicketModel');

exports.createTicket = async (req, res) => {
  try {
    const ticket = await TicketModel.create(req.body);
    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket',
      details: error.message
    });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      language: req.query.language,
      search: req.query.search
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const tickets = await TicketModel.findAll(filters);
    res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets',
      details: error.message
    });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
      details: error.message
    });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await TicketModel.update(req.params.id, req.body);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket',
      details: error.message
    });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await TicketModel.delete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ticket',
      details: error.message
    });
  }
};

