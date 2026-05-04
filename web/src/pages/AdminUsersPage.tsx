import { FormEvent, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import {
  useAdminUsers,
  useReviewFarmerAccess,
  useUpdateUser,
} from "../hooks/useAdmin";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { Select } from "../components/ui/Select";
import { Spinner } from "../components/ui/Spinner";
import type { AccountTypeChangeStatus, Role, User } from "../types";
import { formatDate, getApiError } from "../utils/format";

const roleOptions: Array<{ value: Role | ""; label: string }> = [
  { value: "", label: "All roles" },
  { value: "farmer", label: "Farmer" },
  { value: "buyer", label: "Buyer" },
  { value: "admin", label: "Admin" },
];

const requestOptions: Array<{
  value: AccountTypeChangeStatus | "";
  label: string;
}> = [
  { value: "", label: "Any request state" },
  { value: "pending", label: "Pending request" },
  { value: "approved", label: "Approved request" },
  { value: "rejected", label: "Rejected request" },
];

function roleTone(role: Role): "green" | "amber" | "purple" {
  if (role === "farmer") return "green";
  if (role === "admin") return "purple";
  return "amber";
}

function userId(user: User): string {
  return user._id || user.id;
}

export function AdminUsersPage() {
  const [role, setRole] = useState<Role | "">("");
  const [requestStatus, setRequestStatus] = useState<AccountTypeChangeStatus | "">(
    ""
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data, isLoading, isError, error } = useAdminUsers({
    role,
    requestStatus,
    search,
    page,
    limit: 20,
  });
  const updateUser = useUpdateUser();
  const reviewFarmerAccess = useReviewFarmerAccess();

  async function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function promoteToFarmer(targetUser: User) {
    const id = userId(targetUser);
    setMessage(null);
    setActiveUserId(id);
    try {
      await updateUser.mutateAsync({ id, role: "farmer" });
      setMessage({ type: "success", text: "User role updated to farmer." });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    } finally {
      setActiveUserId(null);
    }
  }

  async function handleAccessReview(
    targetUser: User,
    status: "approved" | "rejected"
  ) {
    const id = userId(targetUser);
    setMessage(null);
    setActiveUserId(id);
    try {
      await reviewFarmerAccess.mutateAsync({ id, status });
      setMessage({
        type: "success",
        text:
          status === "approved"
            ? "Farmer access approved."
            : "Farmer access request rejected.",
      });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    } finally {
      setActiveUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_14rem_14rem] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-sun-100 px-3 py-1 text-xs font-black text-sun-800">
              Admin
            </p>
            <h1 className="mt-4 text-3xl font-black text-stone-950">
              Manage Users
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Review account access and handle farmer-access requests.
            </p>
          </div>
          <Select
            label="Role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as Role | "");
              setPage(1);
            }}
          >
            {roleOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="Access request"
            value={requestStatus}
            onChange={(event) => {
              setRequestStatus(event.target.value as AccountTypeChangeStatus | "");
              setPage(1);
            }}
          >
            {requestOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <form
          onSubmit={submitSearch}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <Input
            label="Search name or phone"
            placeholder="e.g. Amina or +234..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="sm:max-w-sm"
          />
          <Button type="submit" className="sm:w-auto">
            Search
          </Button>
          {search ? (
            <Button
              type="button"
              variant="outline"
              className="sm:w-auto"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          ) : null}
        </form>
      </section>

      {message ? <Alert type={message.type}>{message.text}</Alert> : null}
      {isError ? <Alert type="error">{getApiError(error)}</Alert> : null}

      {isLoading ? (
        <Spinner label="Loading users" />
      ) : data?.users.length ? (
        <div className="space-y-3">
          {data.users.map((item) => {
            const pendingFarmerRequest =
              item.accountTypeChangeRequest?.status === "pending";
            const isBusy =
              activeUserId === userId(item) &&
              (updateUser.isPending || reviewFarmerAccess.isPending);

            return (
              <article
                key={userId(item)}
                className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-stone-950">{item.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{item.phone}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={roleTone(item.role)} className="capitalize">
                      {item.role}
                    </Badge>
                    <Badge tone={item.isActive ? "blue" : "red"}>
                      {item.isActive ? "active" : "deactivated"}
                    </Badge>
                    {item.accountTypeChangeRequest ? (
                      <Badge
                        tone={
                          item.accountTypeChangeRequest.status === "rejected"
                            ? "red"
                            : "amber"
                        }
                        className="capitalize"
                      >
                        request {item.accountTypeChangeRequest.status}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-stone-500 sm:grid-cols-2">
                  <p>Joined: {formatDate(item.createdAt)}</p>
                  <p>
                    KYC: {item.kycVerified ? "verified" : "pending"} · Number:{" "}
                    {item.numberVerified ? "verified" : "pending"} · Location:{" "}
                    {item.locationVerified ? "verified" : "pending"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pendingFarmerRequest ? (
                    <>
                      <Button
                        type="button"
                        icon={<ShieldCheck className="h-4 w-4" />}
                        onClick={() => handleAccessReview(item, "approved")}
                        isLoading={isBusy}
                      >
                        Approve farmer access
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAccessReview(item, "rejected")}
                        isLoading={isBusy}
                      >
                        Reject request
                      </Button>
                    </>
                  ) : item.role !== "farmer" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => promoteToFarmer(item)}
                      isLoading={isBusy}
                    >
                      Set as farmer
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No users found"
          message="Try another filter or search term."
        />
      )}
    </div>
  );
}
