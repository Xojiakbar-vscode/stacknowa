const { Service } = require("../models");

exports.createService = async (req, res) => {
  try {
    // String holatda kelgan JSONlarni (multilingual fields) obyektga aylantiramiz
    let title = req.body.title;
    let description = req.body.description;

    try {
      if (typeof title === 'string') title = JSON.parse(title);
      if (typeof description === 'string') description = JSON.parse(description);
    } catch (e) {
      // JSON formatida bo'lmasa o'z holicha qoladi
    }

    const serviceData = {
      ...req.body,
      title,
      description
    };

    // Validatsiya olib tashlandi
    const service = await Service.create(serviceData);
    
    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [["order", "ASC"]],
      where: { is_active: true },
    });
    res.status(200).send(services);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    res.status(200).send(service);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).send("Service not found");

    // Kelayotgan ma'lumotlarni parse qilish
    let title = req.body.title || service.title;
    let description = req.body.description || service.description;

    try {
      if (typeof title === 'string') title = JSON.parse(title);
      if (typeof description === 'string') description = JSON.parse(description);
    } catch (e) {}

    // DB ni yangilash
    await service.update({
      ...req.body,
      title,
      description
    });

    res.status(200).send(service);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).send("Service not found");

    const serviceData = service.toJSON();
    await service.destroy();

    res.status(200).json({
      message: "Service deleted successfully",
      deletedService: serviceData,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};