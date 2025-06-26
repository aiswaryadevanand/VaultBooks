import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getReminders,
    createReminder,
    deleteReminder,
    updateReminder
} from "../api/reminderAPI";

import { useParams } from "react-router-dom";


const Reminder = () => {
    const navigate = useNavigate();
    const { id: walletId } = useParams(); // Get walletId from URL
    const [reminders, setReminders] = useState([]);
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [frequency, setFrequency] = useState('monthly');

    const [editId, setEditId] = useState(null);
    const [editDescription, setEditDescription] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [editFrequency, setEditFrequency] = useState('');

    const fetchReminders = async () => {
        try {
            const res = await getReminders(walletId);
            setReminders(res.data);
        } catch (err) {
            alert('Failed to fetch reminders');
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
            fetchReminders();
        } catch (err) {
            alert('Failed to create reminder');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this reminder?")) {
            try {
                await deleteReminder(id);
                fetchReminders();
            } catch (err) {
                alert('Failed to delete reminder');
            }
        }
    };

    const handleEdit = (reminder) => {
        setEditId(reminder._id);
        setEditDescription(reminder.description);
        setEditDueDate(reminder.dueDate);
        setEditFrequency(reminder.frequency);
    };

    const handleUpdate = async (id) => {
        try {
            await updateReminder(id, {
                description: editDescription,
                dueDate: editDueDate,
                frequency: editFrequency
            });
            setEditId(null);
            fetchReminders();
        } catch (err) {
            alert('Failed to update reminder');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button
                onClick={() => navigate('/dashboard/wallets')}
                className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
                ← Back to Wallets
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">🔔 Reminders</h2>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
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
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                    ➕ Add Reminder
                </button>
            </form>

            <div className="space-y-3">
                {reminders.length === 0 ? (
                    <p className="text-center text-gray-500">No reminders yet.</p>
                ) : (
                    reminders.map((reminder) => (
                        <div key={reminder._id} className="bg-gray-100 p-4 rounded shadow space-y-2">
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
                                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
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
                                            ✅ Save
                                        </button>
                                        <button
                                            onClick={() => setEditId(null)}
                                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">{reminder.description}</h3>
                                        <p className="text-sm text-gray-600">
                                            Due: {new Date(reminder.dueDate).toLocaleDateString()} | Frequency: {reminder.frequency}
                                        </p>
                                        {new Date(reminder.dueDate) < new Date() && (
                                            <p className="text-xs text-red-600 mt-1 font-medium">⏰ Reminder overdue!</p>
                                        )}
                                        {new Date(reminder.dueDate) >= new Date() && (
                                            <p className="text-xs text-green-600 mt-1 font-medium">✅ Upcoming</p>
                                        )}
                                        {reminder.status !== 'done' && (
                                            <button
                                                onClick={async () => {
                                                    await updateReminder(reminder._id, { status: 'done' });
                                                    fetchReminders();
                                                }}
                                                className="text-sm text-green-700 hover:underline"
                                            >
                                                ✅ Mark as Done
                                            </button>
                                        )}
                                        {reminder.status === 'done' && (
                                            <span className="text-sm text-gray-500 italic">✔ Done</span>
                                        )}

                                    </div>
                                    <div className="flex space-x-2 items-center">
                                        {reminder.status !== 'done' ? (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(reminder)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reminder._id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm text-green-600 font-medium">✔ Completed</span>
                                                <button
                                                    onClick={() => handleDelete(reminder._id)}
                                                    className="text-red-600 hover:underline ml-3"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>

                    ))
                )}
            </div>
        </div>
    );
}
export default Reminder;