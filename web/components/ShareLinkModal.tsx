"use client";

import { Modal } from "antd";
import toast from "react-hot-toast";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: string;
  title?: string;
  description?: string;
}

export default function ShareLinkModal({ 
  isOpen, 
  onClose, 
  link,
  title = "Link Copied Successfully!",
  description = "Share your rejection journey and inspire others to embrace failure as growth!"
}: ShareLinkModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
    >
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
          <p className="text-sm text-gray-500 mb-2 font-medium">Your shareable link:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg p-3 border border-blue-300 break-all text-blue-600 font-mono text-sm">
              {link}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Link copied to clipboard!");
              }}
              className="flex-shrink-0 p-3 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg transition-colors cursor-pointer group"
              title="Copy link"
            >
              <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border-2 border-amber-200">
          <p className="text-sm text-gray-700 font-semibold mb-2">💡 Share it on:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-white rounded-full text-sm border border-amber-300">Twitter/X</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm border border-amber-300">LinkedIn</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm border border-amber-300">Facebook</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm border border-amber-300">Instagram</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm border border-amber-300">WhatsApp</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
        >
          Got it! 👍
        </button>
      </div>
    </Modal>
  );
}
