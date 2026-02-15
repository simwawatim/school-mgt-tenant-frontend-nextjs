import { FaSpinner } from "react-icons/fa";

const loadingSpinner = (
  <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading please wait ...</p>
        </div>
      </div>
);

export default function Loading() {
  return loadingSpinner;
}