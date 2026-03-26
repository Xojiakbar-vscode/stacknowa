const { Service } = require("../models");
const { validateService } = require("../validation/serviceValidation");

exports.createService = async (req, res) => {
  const { error } = validateService(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const service = await Service.create(req.body);
    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
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
  const { error } = validateService(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).send("Service not found");

    await service.update(req.body);
    res.status(200).send(service);
  } catch (error) {
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