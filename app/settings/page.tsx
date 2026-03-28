'use client'

import { useState } from 'react'
import { AuthNavbar } from '@/src/components/auth-navbar'
import { Card } from '@/src/components/ui/card'
import { deleteUserAccount } from '@/src/lib/actions'

export default function SettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteUserAccount()
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E1F5EE]/40 to-white">
      <AuthNavbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-[#04342C] mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manage your account settings
        </p>

        {/* Account Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#04342C] mb-4">Account</h2>
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-[#04342C]">Delete Account</p>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete your account and all your event data
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </Card>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#04342C] text-center mb-2">Delete Account?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Warning: All your events and their data will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
