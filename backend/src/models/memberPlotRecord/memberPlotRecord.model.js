const mongoose = require("mongoose");
const {
  PLOT_CATEGORIES,
  PLOT_AREA_UNITS,
  MEMBER_PLOT_RECORD_STATUSES,
} = require("../../config/constants");
const { ApiError } = require("../../utils/error.util");

const memberPlotRecordSchema = mongoose.Schema(
  {
    membershipNumber: {
      type: String,
      trim: true,
      required: true,
    },
    member: {
      name: { type: String, trim: true, required: true },
      guardianName: { type: String, trim: true },
      cnic: { type: String, trim: true, required: true },
      address: { type: String, trim: true },
    },
    plot: {
      number: { type: String, trim: true, required: true },
      area: {
        value: Number,
        unit: {
          type: String,
          enum: PLOT_AREA_UNITS,
          default: "marla",
        },
      },
      category: {
        type: String,
        enum: PLOT_CATEGORIES,
        default: "Residential",
      },
      location: {
        phase: { type: String, trim: true, required: true },
        block: { type: String, trim: true },
        street: { type: String, trim: true },
      },
    },
    status: {
      type: String,
      enum: MEMBER_PLOT_RECORD_STATUSES,
      default: "Active",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

memberPlotRecordSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    const value = ret.plot?.area?.value;
    const unit = ret.plot?.area?.unit;
    if (value && unit) {
      ret.plot.area.valueWithUnit = `${value} ${unit}`;
    }
    return ret;
  },
});

memberPlotRecordSchema.pre("save", async function (next) {
  try {
    if (this.status === "Active" || this.status === undefined) {
      const filters = {
        membershipNumber: this.membershipNumber,
        status: "Active",
      };
      if (!this.isNew) filters._id = { $ne: this._id };

      // Get the session from the current operation
      const session = this.$session();

      // Pass the session to the query
      const existingRecord = await MemberPlotRecord.findOne(filters).session(
        session
      );

      if (existingRecord) {
        throw new ApiError(
          400,
          `An active record with membership number "${this.membershipNumber.trim()}" already exists.`
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

memberPlotRecordSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const status = update.status || this.getQuery().status;
    const membershipNumber =
      update.membershipNumber || this.getQuery().membershipNumber;
    if (status === "Active" || status === undefined) {
      const filters = {
        membershipNumber,
        status: "Active",
        _id: { $ne: this.getQuery()._id },
      };

      const existingRecord = await MemberPlotRecord.findOne(filters);

      if (existingRecord) {
        throw new ApiError(
          400,
          `An active record with membership number "${filters.membershipNumber.trim()}" already exists.`
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const MemberPlotRecord = mongoose.model(
  "MemberPlotRecord",
  memberPlotRecordSchema
);
module.exports = MemberPlotRecord;
