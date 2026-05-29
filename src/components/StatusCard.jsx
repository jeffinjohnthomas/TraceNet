import React from 'react';
import StepIndicator from './StepIndicator';
import { FileText, UserCircle, Calendar, MessageSquare } from 'lucide-react';

export default function StatusCard({ trackingId, data }) {
  if (!data) return null;
  const steps = ["Submitted", "In Progress", "Closed"];
  const currentStep = steps.indexOf(data.status);

  return (
    <div className="bg-white border border-gray-100 shadow-xl shadow-teal-900/5 rounded-2xl p-6 md:p-8 mt-6 opacity-0 animate-[fade-in_0.5s_ease-out_forwards] translate-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Case Status Report</h3>
          <p className="text-sm font-medium text-gray-500 flex items-center mt-1.5 bg-gray-50 inline-flex px-2 py-1 rounded-md border border-gray-100">
            <FileText className="w-4 h-4 mr-1.5 text-teal-600" /> ID: {trackingId}
          </p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
          data.status === 'Closed' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
          data.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
          'bg-teal-50 text-teal-700 border-teal-200'
        }`}>
          {data.status}
        </span>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep !== -1 ? currentStep : 0} />
      
      <div className="mt-8 space-y-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
        <div className="flex items-center text-sm">
          <UserCircle className="w-5 h-5 text-gray-400 mr-3" />
          <span className="text-gray-600">Assigned Investigator:</span>
          <span className="ml-auto font-semibold text-gray-900">{data.investigator}</span>
        </div>
        <div className="flex items-center text-sm">
          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
          <span className="text-gray-600">Last Updated:</span>
          <span className="ml-auto font-semibold text-gray-900">{data.lastUpdated}</span>
        </div>
      </div>
      
      {data.notes && (
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 flex items-center">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Recent Updates
          </h4>
          <div className="bg-white rounded-lg p-4 text-sm text-gray-700 border border-gray-200 shadow-sm leading-relaxed relative before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-teal-500 before:rounded-r-md">
            {data.notes}
          </div>
        </div>
      )}
    </div>
  );
}
