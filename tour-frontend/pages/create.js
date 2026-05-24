import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { formatVND } from "../components/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOUR_TYPES = ["FIT", "GIT", "MICE"];

const SERVICE_TYPES = [
  "Khách sạn",
  "Vận chuyển",
  "Ăn uống",
  "Tham quan",
  "Vé máy bay",
  "Bảo hiểm",
  "Hướng dẫn viên",
  "Khác",
];

const EMPTY_SERVICE = {
  serviceType: "",
  serviceName: "",
  supplier: "",
  quantity: "",
  unitPrice: "",
  notes: "",
};

const EMPTY_FORM = {
  tourName: "",
  departureDate: "",
  personInCharge: "",
  tourType: "",
  guestCount: "",
};

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [services, setServices] = useState([{ ...EMPTY_SERVICE }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const serviceRows = services.map((s) => ({
    ...s,
    rowTotal:
      parseFloat(s.quantity) > 0 && parseFloat(s.unitPrice) > 0
        ? parseFloat(s.quantity) * parseFloat(s.unitPrice)
        : 0,
  }));

  const totalCost = serviceRows.reduce((sum, s) => sum + s.rowTotal, 0);
  const predictedStatus =
    totalCost > 100_000_000 ? "Chờ duyệt quản lý" : "Đã tiếp nhận";

  const showMiceWarning =
    form.tourType === "MICE" && parseInt(form.guestCount) < 10 && form.guestCount !== "";

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function handleServiceChange(index, field, value) {
    setServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    const key = `service_${index}_${field}`;
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  }

  function addService() {
    setServices((prev) => [...prev, { ...EMPTY_SERVICE }]);
  }

  function removeService(index) {
    if (services.length === 1) return;
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const errs = {};

    if (!form.tourName.trim()) errs.tourName = "Tên tour là bắt buộc";
    if (!form.departureDate) errs.departureDate = "Ngày khởi hành là bắt buộc";
    if (!form.tourType) errs.tourType = "Loại tour là bắt buộc";
    if (!form.guestCount || parseInt(form.guestCount) <= 0)
      errs.guestCount = "Số lượng khách phải > 0";

    if (services.length === 0) errs.services = "Phải có ít nhất 1 dịch vụ";

    services.forEach((s, i) => {
      if (!s.serviceType) errs[`service_${i}_serviceType`] = "Bắt buộc";
      if (!s.serviceName.trim()) errs[`service_${i}_serviceName`] = "Bắt buộc";
      if (!s.supplier.trim()) errs[`service_${i}_supplier`] = "Bắt buộc";
      if (!s.quantity || parseFloat(s.quantity) <= 0)
        errs[`service_${i}_quantity`] = "Phải > 0";
      if (!s.unitPrice || parseFloat(s.unitPrice) <= 0)
        errs[`service_${i}_unitPrice`] = "Phải > 0";
    });

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTimeout(() => {
        const el = document.querySelector("[data-error]");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    const payload = {
      tourName: form.tourName.trim(),
      departureDate: form.departureDate,
      personInCharge: form.personInCharge.trim(),
      tourType: form.tourType,
      guestCount: parseInt(form.guestCount),
      services: services.map((s) => ({
        serviceType: s.serviceType,
        serviceName: s.serviceName.trim(),
        supplier: s.supplier.trim(),
        quantity: parseInt(s.quantity),
        unitPrice: parseFloat(s.unitPrice),
        notes: s.notes.trim() || null,
      })),
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Có lỗi khi tạo phiếu");
      }

      router.push("/");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Tạo phiếu">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Thông tin chung</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2" data-error={errors.tourName ? true : undefined}>
                <label className="label">Tên tour <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`input-field ${errors.tourName ? "border-red-400 ring-red-100" : ""}`}
                  placeholder="VD: Tour Đà Nẵng 4N3Đ"
                  value={form.tourName}
                  onChange={(e) => handleFormChange("tourName", e.target.value)}
                />
                {errors.tourName && <p className="error-text">{errors.tourName}</p>}
              </div>

              <div data-error={errors.departureDate ? true : undefined}>
                <label className="label">Ngày khởi hành <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={`input-field ${errors.departureDate ? "border-red-400" : ""}`}
                  value={form.departureDate}
                  onChange={(e) => handleFormChange("departureDate", e.target.value)}
                />
                {errors.departureDate && <p className="error-text">{errors.departureDate}</p>}
              </div>

              <div>
                <label className="label">Người phụ trách</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Họ và tên"
                  value={form.personInCharge}
                  onChange={(e) => handleFormChange("personInCharge", e.target.value)}
                />
              </div>

              <div data-error={errors.tourType ? true : undefined}>
                <label className="label">Loại tour <span className="text-red-500">*</span></label>
                <div className="flex gap-3 mt-1">
                  {TOUR_TYPES.map((t) => (
                    <label
                      key={t}
                      className={`flex-1 cursor-pointer rounded-lg border-2 py-2.5 text-center text-sm font-semibold transition-all ${
                        form.tourType === t
                          ? t === "FIT"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : t === "GIT"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tourType"
                        value={t}
                        className="sr-only"
                        checked={form.tourType === t}
                        onChange={() => handleFormChange("tourType", t)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
                {errors.tourType && <p className="error-text">{errors.tourType}</p>}
              </div>

              <div data-error={errors.guestCount ? true : undefined}>
                <label className="label">Số lượng khách <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  className={`input-field ${errors.guestCount ? "border-red-400" : ""}`}
                  placeholder="0"
                  value={form.guestCount}
                  onChange={(e) => handleFormChange("guestCount", e.target.value)}
                />
                {errors.guestCount && <p className="error-text">{errors.guestCount}</p>}
              </div>
            </div>

            {showMiceWarning && (
              <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm flex items-start gap-2">
                <div>
                  <strong>Cảnh báo:</strong> Tour loại MICE thường yêu cầu tối thiểu 10 khách.
                  Số lượng hiện tại ({form.guestCount}) có thể không đủ điều kiện.
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Danh sách dịch vụ
                <span className="text-sm font-normal text-gray-400">
                  ({services.length} dịch vụ)
                </span>
              </h3>
              <button
                type="button"
                onClick={addService}
                className="btn-secondary text-xs"
              >
                Thêm dịch vụ
              </button>
            </div>

            {errors.services && <p className="error-text mb-3">{errors.services}</p>}

            <div className="space-y-4">
              {services.map((svc, idx) => {
                const rowTotal = serviceRows[idx]?.rowTotal || 0;

                return (
                  <div
                    key={idx}
                    className="rounded-md border border-gray-200 p-4 relative bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        Dịch vụ #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        {rowTotal > 0 && (
                          <span className="text-xs text-gray-500">
                            Thành tiền:{" "}
                            <span className="font-semibold text-gray-800">
                              {formatVND(rowTotal)}
                            </span>
                          </span>
                        )}
                        {services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(idx)}
                            className="btn-danger text-xs"
                          >
                            Xoá
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div data-error={errors[`service_${idx}_serviceType`] ? true : undefined}>
                        <label className="label text-xs">
                          Loại dịch vụ <span className="text-red-500">*</span>
                        </label>
                        <select
                          className={`input-field text-sm ${
                            errors[`service_${idx}_serviceType`] ? "border-red-400" : ""
                          }`}
                          value={svc.serviceType}
                          onChange={(e) => handleServiceChange(idx, "serviceType", e.target.value)}
                        >
                          <option value="">-- Chọn loại --</option>
                          {SERVICE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        {errors[`service_${idx}_serviceType`] && (
                          <p className="error-text">{errors[`service_${idx}_serviceType`]}</p>
                        )}
                      </div>

                      <div data-error={errors[`service_${idx}_serviceName`] ? true : undefined}>
                        <label className="label text-xs">
                          Tên dịch vụ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`input-field text-sm ${
                            errors[`service_${idx}_serviceName`] ? "border-red-400" : ""
                          }`}
                          placeholder="VD: Khách sạn Mường Thanh"
                          value={svc.serviceName}
                          onChange={(e) => handleServiceChange(idx, "serviceName", e.target.value)}
                        />
                        {errors[`service_${idx}_serviceName`] && (
                          <p className="error-text">{errors[`service_${idx}_serviceName`]}</p>
                        )}
                      </div>

                      <div data-error={errors[`service_${idx}_supplier`] ? true : undefined}>
                        <label className="label text-xs">
                          Nhà cung cấp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`input-field text-sm ${
                            errors[`service_${idx}_supplier`] ? "border-red-400" : ""
                          }`}
                          placeholder="Tên công ty / cá nhân"
                          value={svc.supplier}
                          onChange={(e) => handleServiceChange(idx, "supplier", e.target.value)}
                        />
                        {errors[`service_${idx}_supplier`] && (
                          <p className="error-text">{errors[`service_${idx}_supplier`]}</p>
                        )}
                      </div>

                      <div data-error={errors[`service_${idx}_quantity`] ? true : undefined}>
                        <label className="label text-xs">
                          Số lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          className={`input-field text-sm ${
                            errors[`service_${idx}_quantity`] ? "border-red-400" : ""
                          }`}
                          placeholder="0"
                          value={svc.quantity}
                          onChange={(e) => handleServiceChange(idx, "quantity", e.target.value)}
                        />
                        {errors[`service_${idx}_quantity`] && (
                          <p className="error-text">{errors[`service_${idx}_quantity`]}</p>
                        )}
                      </div>

                      <div data-error={errors[`service_${idx}_unitPrice`] ? true : undefined}>
                        <label className="label text-xs">
                          Đơn giá (₫) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="1000"
                          className={`input-field text-sm ${
                            errors[`service_${idx}_unitPrice`] ? "border-red-400" : ""
                          }`}
                          placeholder="0"
                          value={svc.unitPrice}
                          onChange={(e) => handleServiceChange(idx, "unitPrice", e.target.value)}
                        />
                        {errors[`service_${idx}_unitPrice`] && (
                          <p className="error-text">{errors[`service_${idx}_unitPrice`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="label text-xs">Ghi chú</label>
                        <input
                          type="text"
                          className="input-field text-sm"
                          placeholder="Tuỳ chọn"
                          value={svc.notes}
                          onChange={(e) => handleServiceChange(idx, "notes", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalCost > 0 && (
              <div className="card border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng chi phí phiếu</p>
                  <p className="text-3xl font-bold text-blue-700">{formatVND(totalCost)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <span
                    className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
                      predictedStatus === "Chờ duyệt quản lý"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {predictedStatus}
                  </span>
                  {totalCost > 100_000_000 && (
                    <p className="text-xs text-gray-500 mt-1">Vượt ngưỡng 100,000,000 ₫</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-secondary"
              disabled={submitting}
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                "Đang lưu..."
              ) : (
                "Lưu phiếu"
              )}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
