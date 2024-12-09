const FormSidebar = ({ formSteps, currentStep, goToStep }) => (
    <aside className="w-1/4 bg-base-200 p-4">
      <h2 className="text-lg font-bold mb-4">Form Progress</h2>
      <ul className="menu bg-base-100 w-full p-2 rounded-box">
        {formSteps.map((step, index) => (
          <li key={index}>
            <button
              className={`btn btn-sm btn-block mb-2 ${
                currentStep === index ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => goToStep(index)}
            >
              {step}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
  
  export default FormSidebar;
  