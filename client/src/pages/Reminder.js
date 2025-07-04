
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import {
  getReminders,
  createReminder,
  deleteReminder,
  updateReminder,
} from '../api/reminderAPI';
import { setDueCount } from '../redux/slices/reminderSlice';
import ConfirmDialog from '../components/ConfirmDialog';

const Reminder = () => {
  const { walletId } = useParams();
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.wallets.userRole || 'viewer');

  const [reminders, setReminders] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  const [editId, setEditId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  const updateDueCount = (reminders) => {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);
    const count = reminders.filter((r) => {
      const due = new Date(r.dueDate);
      return due <= in7Days && r.status !== 'done';
    }).length;
    dispatch(setDueCount(count));
  };

  const fetchReminders = async () => {
    try {
      const res = await getReminders(walletId);
      setReminders(res.data);
      updateDueCount(res.data);
    } catch {
      toast.error('Failed to fetch reminders', {
        icon: <CheckCircle color="red" />,
      });
    }
  };

  useEffect(() => {
    if (walletId) fetchReminders();
  }, [walletId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReminder({ walletId, description, dueDate, frequency });
      setDescription('');
      setDueDate('');
      setFrequency('monthly');
      toast.success('Reminder added', { icon: <CheckCircle color="green" /> });
      fetchReminders();
    } catch {
      toast.error('Failed to create reminder', { icon: <CheckCircle color="red" /> });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReminder(confirmId, walletId);
      toast.success('Reminder deleted', { icon: <CheckCircle color="red" /> });
      fetchReminders();
    } catch {
      toast.error('Failed to delete reminder', { icon: <CheckCircle color="red" /> });
    } finally {
      setConfirmId(null);
    }
  };

  const handleEdit = (reminder) => {
    setEditId(reminder._id);
    setEditDescription(reminder.description);
    setEditDueDate(reminder.dueDate.split('T')[0]);
    setEditFrequency(reminder.frequency);
  };

  const handleUpdate = async (id) => {
    try {
      await updateReminder(id, {
        description: editDescription,
        dueDate: editDueDate,
        frequency: editFrequency,
        walletId,
      });
      setEditId(null);
      toast.success('Reminder updated', { icon: <CheckCircle color="green" /> });
      fetchReminders();
    } catch {
      toast.error('Failed to update reminder', { icon: <CheckCircle color="red" /> });
    }
  };

  const handleMarkAsDone = async (id) => {
    try {
      await updateReminder(id, { status: 'done', walletId });
      toast.success('Marked as done', { icon: <CheckCircle color="green" /> });
      fetchReminders();
    } catch {
      toast.error('Failed to mark as done', { icon: <CheckCircle color="red" /> });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      {isToastVisible && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 transition duration-300" />
      )}

      <Toaster
        toastOptions={{
          duration: 2000,
          className:
            'bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-200 text-center font-medium animate-fade-slide',
        }}
        containerStyle={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      />

      <h2 className="text-2xl font-bold mb-6 text-left">Reminders</h2>

      {['owner', 'accountant'].includes(userRole) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded shadow space-y-4 mb-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g. Pay electricity bill"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            Add Reminder
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <p className="text-center text-gray-500">No reminders yet.</p>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder._id}
              className="bg-gray-100 p-4 rounded shadow space-y-2"
            >
              {editId === reminder._id ? (
                <>
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <input
                    type="date"
                    value={editDueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(reminder._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{reminder.description}</h3>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(reminder.dueDate).toLocaleDateString()} | Frequency: {reminder.frequency}
                    </p>
                    {reminder.status === 'done' ? (
                      <p className="text-sm text-gray-500 italic">✔ Done</p>
                    ) : new Date(reminder.dueDate) < new Date() ? (
                      <p className="text-xs text-red-600 font-medium">Reminder overdue!</p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium">Upcoming</p>
                    )}
                    {reminder.status !== 'done' && ['owner', 'accountant'].includes(userRole) && (
                      <button
                        onClick={() => handleMarkAsDone(reminder._id)}
                        className="text-sm text-green-700 "
                      >
                        Mark as Done
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {reminder.status !== 'done' && ['owner', 'accountant'].includes(userRole) && (
                      <>
                        <button
                          onClick={() => handleEdit(reminder)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        {userRole === 'owner' && (
                          <button
                            onClick={() => setConfirmId(reminder._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                    {reminder.status === 'done' && userRole === 'owner' && (
                      <button
                        onClick={() => setConfirmId(reminder._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {confirmId && (
        <ConfirmDialog
          message="Are you sure you want to delete this reminder?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default Reminder;
