import React from 'react';

export const CourseTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs tabs-boxed mb-6">
      <a 
        className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`} 
        onClick={() => setActiveTab('overview')}
      >
        Overview
      </a>
      <a 
        className={`tab ${activeTab === 'curriculum' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('curriculum')}
      >
        Curriculum
      </a>
      <a 
        className={`tab ${activeTab === 'instructor' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('instructor')}
      >
        Instructor
      </a>
      <a 
        className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
        onClick={() => setActiveTab('reviews')}
      >
        Reviews
      </a>
    </div>
  );
};
