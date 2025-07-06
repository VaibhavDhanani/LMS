import React from "react";

const ParticipantList = ({ participants }) => {
  return (
    <div className="w-64 bg-white shadow-sm rounded-lg p-4 h-fit border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Participants</h3>
        <span className="text-xs text-gray-500">{participants.length}</span>
      </div>
      <ul className="space-y-2 text-sm">
        {participants.map((p, index) => (
          <li key={p.socketId} className="flex items-center gap-2 text-gray-700">
            {/* <div className="w-2 h-2 bg-green-500 rounded-full" /> */}
            <span className="truncate">
              <span className="font-medium text-gray-600">{index + 1}.</span>{" "}
              {p.name || "Anonymous"}{" "}
              <span className="text-gray-400">({p.email || "no email"})</span>
            </span>
          </li>
        ))}

      </ul>
    </div>
  );
};

export default ParticipantList;
