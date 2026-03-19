const prisma = require('../utils/prisma');

const ensureInquiryModel = (res) => {
  if (!prisma?.inquiry) {
    res.status(500).json({
      success: false,
      error: 'Prisma client is missing the Inquiry model. Run: npx prisma generate && npx prisma migrate dev, then restart the server.'
    });
    return false;
  }
  return true;
};

exports.createInquiry = async (req, res) => {
  try {
    if (!ensureInquiryModel(res)) return;
    const {
      userId,
      name,
      email,
      phone,
      state,
      district,
      itinerary,
      itinerarySnapshot,
      hotel,
      hotelSnapshot,
      food,
      foodSnapshot,
      days,
      people,
      totalBudget,
      startDate,
      tripDate,
    } = req.body;

    const effectiveUserId = req.user?.id || userId || null;
    const effectiveItinerarySnapshot = itinerarySnapshot ?? itinerary ?? null;
    const effectiveHotelSnapshot = hotelSnapshot ?? (hotel ? { name: hotel } : null);
    const effectiveFoodSnapshot = foodSnapshot ?? (food ? { name: food } : null);

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, error: 'name, email, phone are required' });
    }
    if (!effectiveItinerarySnapshot) {
      return res.status(400).json({ success: false, error: 'itinerary is required' });
    }
    if (!tripDate && !startDate) {
      return res.status(400).json({ success: false, error: 'tripDate is required' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: effectiveUserId,
        name,
        email,
        phone,
        state: state ?? null,
        district: district ?? null,
        itinerary: itinerary ?? null,
        hotel: hotel ?? null,
        food: food ?? null,
        itinerarySnapshot: effectiveItinerarySnapshot,
        hotelSnapshot: effectiveHotelSnapshot,
        foodSnapshot: effectiveFoodSnapshot,
        days: typeof days === 'number' ? days : (days ? Number(days) : null),
        people: typeof people === 'number' ? people : (people ? Number(people) : null),
        totalBudget: typeof totalBudget === 'number' ? totalBudget : (totalBudget ? Number(totalBudget) : null),
        startDate: startDate ? new Date(startDate) : null,
        tripDate: (tripDate || startDate) ? new Date(tripDate || startDate) : null,
      },
    });

    console.log(`[POST /inquiry] Created inquiry: ${inquiry.id}`);
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    console.error(`[POST /inquiry] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    if (!ensureInquiryModel(res)) return;
    if (!req.user?.id) return res.sendStatus(401);
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`[GET /inquiry/my] Fetched ${inquiries.length} inquiries for user ${req.user.id}`);
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    console.error(`[GET /inquiry/my] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    if (!ensureInquiryModel(res)) return;
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log(`[GET /inquiry] Fetched ${inquiries.length} total inquiries`);
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    console.error(`[GET /inquiry] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    if (!ensureInquiryModel(res)) return;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ success: false, error: 'Not found' });
    const isOwner = req.user?.id && inquiry.userId && req.user.id === inquiry.userId;
    const isAdminUser = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdminUser) return res.sendStatus(403);
    console.log(`[GET /inquiry/${id}] Fetched inquiry`);
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    console.error(`[GET /inquiry/${req.params.id}] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  try {
    if (!ensureInquiryModel(res)) return;
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });
    console.log(`[PATCH /inquiry/${id}] Updated status to ${status}`);
    res.status(200).json({ success: true, data: updatedInquiry });
  } catch (err) {
    console.error(`[PATCH /inquiry/${req.params.id}] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

