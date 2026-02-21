import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { fetchUnavailabilityAPI, fetchWeekSlotsAPI, getUserProfile, saveDefaultAvailabilityAPI } from "store/globalSlice";
import { Formik, Form, Field } from "formik";
import MessagePopup from "components/layouts/MessagePopup/MessagePopup";

const API_BASE = "http://localhost:3000/api/v1/slot";

const getWeekDates = (startDate) =>
    [...Array(7)].map((_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

const formatDate = (date) => date.toISOString().slice(0, 10);

const daysOfWeek = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
];

const SlotManagementWeekly = () => {
    const dispatch = useDispatch();
    const providerId = localStorage.getItem("userId");

    const [weekStart, setWeekStart] = useState(new Date());
    const [weekDates, setWeekDates] = useState(getWeekDates(new Date()));
    const [slotsByDate, setSlotsByDate] = useState({});
    const [unavailability, setUnavailability] = useState([]);
    const [showDefaultForm, setShowDefaultForm] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addDate, setAddDate] = useState("");
    const [addOverride, setAddOverride] = useState({ isDayOff: false, timeRanges: [] });
    const [editingDefault, setEditingDefault] = useState(false);

    // Sync editableDefaultAvailability when defaultAvailability changes

    const [defaultAvailability, setDefaultAvailability] = useState({
        startTime: "09:00",
        endTime: "17:00",
        workingDays: [],
    });
    const [editableDefaultAvailability, setEditableDefaultAvailability] = useState(defaultAvailability);

    useEffect(() => {
        setEditableDefaultAvailability(defaultAvailability);
    }, [defaultAvailability]);

    const [loadingDefault, setLoadingDefault] = useState(true);

    const fetchDefaultAvailability = async () => {
        try {
            const res = await dispatch(getUserProfile(providerId));
            const defaultAvail = res?.data?.providerDetails?.defaultAvailability;
            if (defaultAvail) setDefaultAvailability(defaultAvail);
        } catch {
        } finally {
            setLoadingDefault(false);
        }
    };

    const fetchWeekSlots = async () => {
        if (!providerId || !weekStart) return;

        const startDate = weekStart.toISOString().slice(0, 10);
        const endDate = formatDate(new Date(weekStart.getTime() + 6 * 86400000));

        const res = await dispatch(fetchWeekSlotsAPI(providerId, startDate, endDate));

        if (res?.success) {
            setSlotsByDate(res.slotsByDate);
        }
    };

    const fetchUnavailability = async () => {
        const res = await dispatch(fetchUnavailabilityAPI(providerId));
        if (res?.success) {
            setUnavailability(res?.unavailability || []);
        }
    };

    useEffect(() => {
        fetchDefaultAvailability();
        fetchUnavailability();
    }, []);

    useEffect(() => {
        setWeekDates(getWeekDates(weekStart));
        if (defaultAvailability?.workingDays?.length > 0) fetchWeekSlots();
    }, [weekStart, defaultAvailability]);

    const saveDefaultAvailability = async (values) => {
        if (!values.workingDays.length) {
            setMessagePopup({
                show: true,
                title: "Validation Error",
                message: "Please select at least one working day",
                type: "warning",
            });
            return;
        }

        // try {
        //     await axios.post(`${API_BASE}/${providerId}/default-availability`, values);
        //     alert("Default availability saved");
        //     fetchDefaultAvailability();
        // } catch {
        //     alert("Error saving default availability");
        // }
        const res = await dispatch(saveDefaultAvailabilityAPI(providerId, values));
        if (res?.success) {
            setMessagePopup({
                show: true,
                title: "Success",
                message: "Default availability saved",
                type: "success",
            });
            fetchDefaultAvailability();
        } else {
            setMessagePopup({
                show: true,
                title: "Error",
                message: "Error saving default availability",
                type: "error",
            });
        }
    };

    const saveAddOverride = async () => {
        if (!addDate) {
            setMessagePopup({
                show: true,
                title: "Validation Error",
                message: "Please select a date",
                type: "warning",
            });
            return;
        }
        if (!addOverride.isDayOff && addOverride.timeRanges.length === 0) {
            setMessagePopup({
                show: true,
                title: "Validation Error",
                message: "Add a time range or choose Day Off",
                type: "warning",
            });
            return;
        }

        const { startTime: defStart, endTime: defEnd } = defaultAvailability;

        for (const range of addOverride.timeRanges) {
            if (range.startTime < defStart || range.endTime > defEnd) {
                setMessagePopup({
                    show: true,
                    title: "Validation Error",
                    message: `Time range must be within default availability: ${defStart} - ${defEnd}`,
                    type: "warning",
                });
                return;
            }
        }

        try {
            const overrideData = {
                date: addDate,
                isDayOff: addOverride.isDayOff,
                timeRanges: addOverride.timeRanges
            };
            await dispatch(overrideAvailabilityAPI(providerId, overrideData));

            setMessagePopup({
                show: true,
                title: "Success",
                message: "Unavailability added",
                type: "success",
            });
            setShowAddModal(false);
            fetchWeekSlots();
        } catch {
            setMessagePopup({
                show: true,
                title: "Error",
                message: "Error adding unavailability",
                type: "error",
            });
        }
    };

    if (loadingDefault) return <div>Loading...</div>;

    return (
        <>
            <MessagePopup
                show={messagePopup.show}
                onHide={() => setMessagePopup({ ...messagePopup, show: false })}
                title={messagePopup.title}
                message={messagePopup.message}
                type={messagePopup.type}
            />
        <div className="container mt-4">
            {showDefaultForm || defaultAvailability.workingDays.length === 0 ? (
                <div>
                    <h2>Set Default Availability</h2>

                    <Formik
                        initialValues={defaultAvailability}
                        onSubmit={async (values) => {
                            await saveDefaultAvailability(values);
                            setShowDefaultForm(false);
                        }}
                        enableReinitialize
                    >
                        {({ values, handleChange }) => (
                            <Form>
                                <div className="mb-2">
                                    <label>Start Time</label>
                                    <Field type="time" name="startTime" className="form-control" />
                                </div>

                                <div className="mb-2">
                                    <label>End Time</label>
                                    <Field type="time" name="endTime" className="form-control" />
                                </div>

                                <div className="mb-2">
                                    <label>Working Days</label>
                                    <div>
                                        {daysOfWeek.map((day) => (
                                            <label key={day.value} className="me-3">
                                                <input
                                                    type="checkbox"
                                                    name="workingDays"
                                                    value={day.value}
                                                    checked={values.workingDays.includes(day.value)}
                                                    onChange={(e) => {
                                                        const newDays = e.target.checked
                                                            ? [...values.workingDays, day.value]
                                                            : values.workingDays.filter((d) => d !== day.value);

                                                        handleChange({
                                                            target: { name: "workingDays", value: newDays },
                                                        });
                                                    }}
                                                />
                                                {day.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    Save
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary ms-2"
                                    onClick={() => setShowDefaultForm(false)}
                                >
                                    Cancel
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-between mb-3">
                        <h2>Availability Management</h2>

                        <button
                            className="px-3"
                            style={{ backgroundColor: "red", border: "none", borderRadius: "12px" }}
                            onClick={() => {
                                setAddDate("");
                                setAddOverride({ isDayOff: false, timeRanges: [] });
                                setShowAddModal(true);
                            }}
                        >
                            Add Unavailability
                        </button>
                    </div>
                    <div>
                        <p>You can change default availability from here.</p>
                    </div>

                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Day Off</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daysOfWeek.map((day) => {
                                const isWorking = editableDefaultAvailability.workingDays.includes(day.value);
                                const slots = slotsByDate[formatDate(weekDates[day.value])] || [];

                                return (
                                    <tr key={day.value}>
                                        <td>{day.label}</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={!isWorking}
                                                disabled={!editingDefault}
                                                onChange={(e) => {
                                                    const newDays = e.target.checked
                                                        ? editableDefaultAvailability.workingDays.filter(d => d !== day.value)
                                                        : [...editableDefaultAvailability.workingDays, day.value];
                                                    setEditableDefaultAvailability({
                                                        ...editableDefaultAvailability,
                                                        workingDays: newDays,
                                                    });
                                                }}
                                            />
                                            Day Off
                                        </td>
                                        <td>
                                            <input
                                                type="time"
                                                value={editableDefaultAvailability.startTime}
                                                disabled={!editingDefault || !isWorking}
                                                onChange={(e) =>
                                                    setEditableDefaultAvailability({ ...editableDefaultAvailability, startTime: e.target.value })
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="time"
                                                value={editableDefaultAvailability.endTime}
                                                disabled={!editingDefault || !isWorking}
                                                onChange={(e) =>
                                                    setEditableDefaultAvailability({ ...editableDefaultAvailability, endTime: e.target.value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    {editingDefault ? (
                        <div className="mt-3">
                            <button
                                className="btn btn-success me-2"
                                onClick={async () => {
                                    await dispatch(saveDefaultAvailabilityAPI(providerId, editableDefaultAvailability));
                                    setEditingDefault(false);
                                    fetchDefaultAvailability();
                                    fetchWeekSlots();
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditableDefaultAvailability(defaultAvailability);
                                    setEditingDefault(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-primary mt-3" onClick={() => setEditingDefault(true)}>
                            Change Default Availability
                        </button>
                    )}


                    <h4 className="mt-4">Unavailability</h4>

                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Time Ranges</th>
                            </tr>
                        </thead>

                        <tbody>
                            {unavailability.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No unavailability added.
                                    </td>
                                </tr>
                            )}

                            {unavailability.map((u, idx) => (
                                <tr key={idx}>
                                    <td>{u.date}</td>
                                    <td>{u.isDayOff ? "Day Off" : "Custom Time"}</td>
                                    <td>
                                        {u.isDayOff ? (
                                            "—"
                                        ) : (
                                            u.timeRanges.map((t, i) => (
                                                <div key={i}>
                                                    {t.startTime} - {t.endTime}
                                                </div>
                                            ))
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Unavailability</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Date */}
                    <div className="mb-3">
                        <label>Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={addDate}
                            min={formatDate(new Date())}
                            onChange={(e) => setAddDate(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>
                            <input
                                type="checkbox"
                                checked={addOverride.isDayOff}
                                onChange={(e) =>
                                    setAddOverride({ ...addOverride, isDayOff: e.target.checked })
                                }
                            />{" "}
                            Day Off
                        </label>
                    </div>

                    {!addOverride.isDayOff &&
                        addOverride.timeRanges.map((range, index) => (
                            <div key={index} className="d-flex gap-2 mb-2">
                                <input
                                    type="time"
                                    value={range.startTime}
                                    onChange={(e) => {
                                        const updated = [...addOverride.timeRanges];
                                        updated[index].startTime = e.target.value;
                                        setAddOverride({ ...addOverride, timeRanges: updated });
                                    }}
                                />
                                <input
                                    type="time"
                                    value={range.endTime}
                                    onChange={(e) => {
                                        const updated = [...addOverride.timeRanges];
                                        updated[index].endTime = e.target.value;
                                        setAddOverride({ ...addOverride, timeRanges: updated });
                                    }}
                                />
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                        setAddOverride({
                                            ...addOverride,
                                            timeRanges: addOverride.timeRanges.filter((_, i) => i !== index),
                                        })
                                    }
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                    {!addOverride.isDayOff && (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                                setAddOverride({
                                    ...addOverride,
                                    timeRanges: [
                                        ...addOverride.timeRanges,
                                        {
                                            startTime: defaultAvailability.startTime,
                                            endTime: defaultAvailability.endTime,
                                        },
                                    ],
                                })
                            }
                        >
                            Add Time Range
                        </button>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveAddOverride}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
        </>
    );
};

export default SlotManagementWeekly;
