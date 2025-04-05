const FormSidebar = ({ formSteps, currentStep, goToStep }) => (
    <aside className="w-72 bg-base-200 p-6 border-r border-base-300 min-h-screen">
        <div className="sticky top-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-base-content">Course Setup</h2>
                <div className="badge badge-primary">
                    {currentStep + 1}/{formSteps.length}
                </div>
            </div>
            
            <div className="bg-base-100 rounded-xl shadow-lg p-4">
                <ul className="space-y-2">
                    {formSteps.map((step, index) => {
                        const isCurrent = index === currentStep;
                        const isComplete = index < currentStep;
                        
                        return (
                            <li key={index}>
                                <button
                                    className={`group w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                                        ${isCurrent ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'}
                                        hover:scale-105`}
                                    onClick={() => goToStep(index)}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full
                                        ${isCurrent ? 'bg-primary-content text-primary' :
                                        isComplete ? 'bg-success text-success-content' : 'bg-base-300 text-base-content/70'}`}
                                    >
                                        {isComplete ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <span className="text-sm">{index + 1}</span>
                                        )}
                                    </div>
                                    
                                    <span className="text-sm font-medium">{step}</span>
                                    
                                    {isCurrent && (
                                        <div className="ml-auto transform transition-transform duration-300 group-hover:translate-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            {/* <div className="mt-6 p-4 bg-base-100 rounded-xl shadow-lg">
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-base-content">Course Progress</h3>
                    <progress
                        className="progress progress-primary w-full"
                        value={(currentStep + 1) * (100 / formSteps.length)}
                        max="100"
                    ></progress>
                    <p className="text-xs text-base-content/70">
                        {Math.round(((currentStep + 1) / formSteps.length) * 100)}% completed
                    </p>
                </div>
            </div> */}
        </div>
    </aside>
);

export default FormSidebar;
