const OperatingFixedAssets = require("../../models/operatingFixedAssetsModels/operatingFixedAssets");

module.exports = {
  createOpertingFixedAssets: async (req, res) => {
    const {
      building,
      waterTank,
      tubeWell,
      furnitureAndFixture,
      officeEquipment,
      computerEquipment,
      armsAndAmmuntion,
      vehicles,
      tractorAndTrolly,
      transformer,
      machinery
    } = req.body;
    try {
      if (!building || !waterTank || !tubeWell || !furnitureAndFixture || !officeEquipment || !computerEquipment || !armsAndAmmuntion || !vehicles || !tractorAndTrolly || !transformer || !machinery) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const operatingFixedAssets = new OperatingFixedAssets({
        building: building,
        waterTank: waterTank,
        tubeWell: tubeWell,
        furnitureAndFixture: furnitureAndFixture,
        officeEquipment: officeEquipment,
        computerEquipment: computerEquipment,
        armsAndAmmuntion: armsAndAmmuntion,
        vehicles: vehicles,
        tractorAndTrolly: tractorAndTrolly,
        transformer:transformer,
        machinery: machinery
      });
      await operatingFixedAssets.save();
      res.status(200).json({
        message: "OperatingFixedAssets created successfully",
        operatingFixedAssets: operatingFixedAssets,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateOperatingFixedAssets: async (req, res) => {
    const id = req.query.id;
    try {
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const {
            building,
            waterTank,
            tubeWell,
            furnitureAndFixture,
            officeEquipment,
            computerEquipment,
            armsAndAmmuntion,
            vehicles,
            tractorAndTrolly,
            transformer,
            machinery
        } = req.body;

        const operatingFixedAssets = await OperatingFixedAssets.findById(id);
        if (!operatingFixedAssets) {
            return res.status(404).json({ message: "OperatingFixedAssets not found" });
        }

        if (building !== undefined) {
            operatingFixedAssets.building = (parseInt(operatingFixedAssets.building) || 0) + parseInt(building);
        }
        if (waterTank !== undefined) {
            operatingFixedAssets.waterTank = (parseInt(operatingFixedAssets.waterTank) || 0) + parseInt(waterTank);
        }
        if (tubeWell !== undefined) {
            operatingFixedAssets.tubeWell = (parseInt(operatingFixedAssets.tubeWell) || 0) + parseInt(tubeWell);
        }
        if (furnitureAndFixture !== undefined) {
            operatingFixedAssets.furnitureAndFixture = (parseInt(operatingFixedAssets.furnitureAndFixture) || 0) + parseInt(furnitureAndFixture);
        }
        if (officeEquipment !== undefined) {
            operatingFixedAssets.officeEquipment = (parseInt(operatingFixedAssets.officeEquipment) || 0) + parseInt(officeEquipment);
        }
        if (computerEquipment !== undefined) {
            operatingFixedAssets.computerEquipment = (parseInt(operatingFixedAssets.computerEquipment) || 0) + parseInt(computerEquipment);
        }
        if (armsAndAmmuntion !== undefined) {
            operatingFixedAssets.armsAndAmmuntion = (parseInt(operatingFixedAssets.armsAndAmmuntion) || 0) + parseInt(armsAndAmmuntion);
        }
        if (vehicles !== undefined) {
            operatingFixedAssets.vehicles = (parseInt(operatingFixedAssets.vehicles) || 0) + parseInt(vehicles);
        }
        if (tractorAndTrolly !== undefined) {
            operatingFixedAssets.tractorAndTrolly = (parseInt(operatingFixedAssets.tractorAndTrolly) || 0) + parseInt(tractorAndTrolly);
        }
        if (transformer !== undefined) {
            operatingFixedAssets.transformer = (parseInt(operatingFixedAssets.transformer) || 0) + parseInt(transformer);
        }
        if (machinery !== undefined) {
            operatingFixedAssets.machinery = (parseInt(operatingFixedAssets.machinery) || 0) + parseInt(machinery);
        }
        await operatingFixedAssets.save();
        res.status(200).json({
            message: "OperatingFixedAssets updated successfully",
            operatingFixedAssets: operatingFixedAssets,
        });
      } catch (err) {
        res.status(500).json({ message: err });
      }
    },
}