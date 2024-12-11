const PricingStep = ({ formData, updateFormData }) => {
  const handleInputChange = (key, value) => {
    updateFormData("pricing", {
      ...formData.pricing,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Instructor and Pricing Details</h2>

      {/* Course Price */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Course Price (USD)</span>
        </label>
        <input
          type="number"
          className="input input-bordered"
          placeholder="Enter course price"
          value={formData.pricing?.price || ""}
          onChange={(e) => handleInputChange("price", e.target.value)}
        />
      </div>

      {/* Discount Option */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text font-semibold">Offer Discount?</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={formData.pricing?.discountEnabled || false}
            onChange={(e) =>
              handleInputChange("discountEnabled", e.target.checked)
            }
          />
        </label>
      </div>

      {formData.pricing?.discountEnabled && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Discount Percentage
            </span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            placeholder="Enter discount percentage"
            value={formData.pricing?.discount || ""}
            onChange={(e) => handleInputChange("discount", e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default PricingStep;
