import { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import {
  statusBadge,
  tourTypeBadge,
  formatVND,
  formatDate,
  readErrorMessage,
} from "../components/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RequestListPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const latestDetailId = useRef(null);

  // Fetch all requests
  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/requests`);
      if (!res.ok) throw new Error("Không thể tải danh sách phiếu");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  // Fetch detail on row click
  async function fetchDetail(id) {
    if (selectedId === id) {
      latestDetailId.current = null;
      setSelectedId(null);
      setDetail(null);
      setDetailError(null);
      return;
    }
    latestDetailId.current = id;
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/requests/${id}`);
      if (!res.ok) throw new Error(await readErrorMessage(res, "Không thể tải chi tiết phiếu"));
      const data = await res.json();
      // Bỏ qua response cũ nếu người dùng đã chọn phiếu khác
      if (latestDetailId.current === id) setDetail(data);
    } catch (err) {
      if (latestDetailId.current === id) {
        setDetailError(
          err instanceof TypeError ? "Không thể kết nối tới máy chủ" : err.message
        );
      }
    } finally {
      if (latestDetailId.current === id) setDetailLoading(false);
    }
  }

  return (
    <Layout title="Danh sách phiếu">
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <p className="text-sm text-gray-500">
          Tổng cộng <span className="font-semibold text-gray-800">{requests.length}</span> phiếu
        </p>
        <div className="flex gap-2">
          <button onClick={fetchRequests} className="btn-secondary" disabled={loading}>
            Làm mới
          </button>
          <Link href="/create" className="btn-primary">
            Tạo phiếu mới
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-16 text-gray-500">
          Đang tải...
        </div>
      ) : requests.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg font-medium">Chưa có phiếu nào</p>
          <Link href="/create" className="btn-primary mt-4">Tạo phiếu đầu tiên</Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên tour</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày đi</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Phụ trách</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Loại</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Khách</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Tổng chi phí</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, idx) => {
                  const sb = statusBadge(r.status);
                  const tb = tourTypeBadge(r.tourType);
                  const isSelected = selectedId === r.id;

                  return (
                    <Fragment key={r.id}>
                      <tr
                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50" : idx % 2 === 0 ? "" : "bg-gray-50/50"
                        }`}
                        onClick={() => fetchDetail(r.id)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {r.showMiceWarning && (
                            <span className="mr-1 text-amber-600 text-xs font-semibold uppercase tracking-wide" title="Cảnh báo: MICE < 10 khách">
                              MICE
                            </span>
                          )}
                          {r.tourName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(r.departureDate)}</td>
                        <td className="px-4 py-3 text-gray-600">{r.personInCharge || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tb.bg} ${tb.text}`}>
                            {r.tourType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">{r.guestCount}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatVND(r.totalCost)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sb.bg} ${sb.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`}></span>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">
                          {isSelected ? "Đang xem" : "Mở"}
                        </td>
                      </tr>

                      {isSelected && (
                        <tr>
                          <td colSpan={8} className="px-4 pb-4 pt-0 bg-blue-50">
                            {detailLoading ? (
                              <p className="text-center text-gray-500 py-4">Đang tải chi tiết...</p>
                            ) : detailError ? (
                              <p className="text-center text-red-600 py-4">{detailError}</p>
                            ) : detail ? (
                              <div className="mt-3">
                                {detail.showMiceWarning && (
                                  <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm flex items-center gap-2">
                                    <strong>Cảnh báo:</strong> Tour MICE với số lượng khách &lt; 10 người
                                  </div>
                                )}

                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
                                  Danh sách dịch vụ ({detail.services?.length || 0})
                                </p>
                                <table className="w-full text-xs rounded-lg overflow-hidden border border-gray-200">
                                  <thead className="bg-white">
                                    <tr>
                                      <th className="text-left px-3 py-2 text-gray-600 font-semibold">Loại DV</th>
                                      <th className="text-left px-3 py-2 text-gray-600 font-semibold">Tên dịch vụ</th>
                                      <th className="text-left px-3 py-2 text-gray-600 font-semibold">Nhà cung cấp</th>
                                      <th className="text-right px-3 py-2 text-gray-600 font-semibold">SL</th>
                                      <th className="text-right px-3 py-2 text-gray-600 font-semibold">Đơn giá</th>
                                      <th className="text-right px-3 py-2 text-gray-600 font-semibold">Thành tiền</th>
                                      <th className="text-left px-3 py-2 text-gray-600 font-semibold">Ghi chú</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white">
                                    {detail.services?.map((s, i) => (
                                      <tr key={i} className="border-t border-gray-100">
                                        <td className="px-3 py-2 text-gray-700">{s.serviceType}</td>
                                        <td className="px-3 py-2 font-medium text-gray-900">{s.serviceName}</td>
                                        <td className="px-3 py-2 text-gray-700">{s.supplier}</td>
                                        <td className="px-3 py-2 text-right text-gray-700">{s.quantity}</td>
                                        <td className="px-3 py-2 text-right text-gray-700">{formatVND(s.unitPrice)}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{formatVND(s.totalAmount)}</td>
                                        <td className="px-3 py-2 text-gray-500">{s.notes || "—"}</td>
                                      </tr>
                                    ))}
                                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                                      <td colSpan={5} className="px-3 py-2 font-bold text-right text-gray-700">
                                        Tổng chi phí phiếu:
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-blue-700">
                                        {formatVND(detail.totalCost)}
                                      </td>
                                      <td></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
