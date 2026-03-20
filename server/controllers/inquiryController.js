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
      destinationId,
      destinationName
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
        destinationId: destinationId ?? null,
        destinationName: destinationName ?? null,
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
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    console.error(`[GET /inquiry] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    let inquiry = null;
    
    // Check if ID is numeric (Inquiry table)
    const numericId = Number(id);
    if (!isNaN(numericId) && Number.isFinite(numericId)) {
      inquiry = await prisma.inquiry.findUnique({ where: { id: numericId } });
    }

    // If not found or ID is string, check WishlistLead (Planned trip)
    if (!inquiry) {
      const lead = await prisma.wishlistLead.findUnique({ where: { id } });
      if (lead) {
        // Normalize lead to look like an inquiry for the frontend
        inquiry = {
          id: lead.id,
          name: "Planned Trip",
          email: lead.email,
          destinationName: lead.destination,
          itinerary: lead.itinerary,
          totalBudget: lead.totalBudget,
          createdAt: lead.createdAt,
          status: "PLANNED",
          isLead: true
        };
      }
    }

    // If still not found, check WishlistItem (could be a saved destination)
    if (!inquiry) {
      const wishItem = await prisma.wishlistItem.findUnique({ where: { id } });
      if (wishItem && wishItem.entityType === 'Destination') {
        const dest = await prisma.destination.findUnique({ 
          where: { id: wishItem.entityId },
          include: { activities: true, district: { include: { state: true } } }
        });
        if (dest) {
          inquiry = {
            id: wishItem.id,
            name: "Saved Destination",
            destinationName: dest.name,
            state: dest.district?.state?.name,
            district: dest.district?.name,
            itinerary: { timeline: [{ day: 1, title: dest.name, activities: dest.activities }] },
            totalBudget: parseFloat(dest.avgCost?.replace(/[^0-9.-]+/g,"") || '0'),
            createdAt: wishItem.createdAt,
            status: "SAVED",
            isDestination: true
          };
        }
      }
    }

    // Direct Destination ID fallback
    if (!inquiry) {
        const dest = await prisma.destination.findUnique({ 
            where: { id },
            include: { activities: true, district: { include: { state: true } } }
        });
        if (dest) {
          inquiry = {
            id: dest.id,
            name: "Destination Detail",
            destinationName: dest.name,
            state: dest.district?.state?.name,
            district: dest.district?.name,
            itinerary: { timeline: [{ day: 1, title: dest.name, activities: dest.activities }] },
            totalBudget: parseFloat(dest.avgCost?.replace(/[^0-9.-]+/g,"") || '0'),
            createdAt: dest.createdAt,
            status: "PLACE",
            isDestination: true
          };
        }
    }

    if (!inquiry) return res.status(404).json({ success: false, error: 'Journey or Destination not found' });
    
    // Authorization check
    const isOwner = !inquiry.email || (req.user?.email && inquiry.email === req.user.email) || (inquiry.userId && inquiry.userId === req.user.id);
    const isAdminUser = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdminUser) return res.sendStatus(403);

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
    res.status(200).json({ success: true, data: updatedInquiry });
  } catch (err) {
    console.error(`[PATCH /inquiry/${req.params.id}] Error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

