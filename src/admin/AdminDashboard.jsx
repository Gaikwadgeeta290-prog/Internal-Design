import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";


import {
  LayoutDashboard,
  FolderKanban,
  Mail,
  CalendarDays,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Menu,
  X,
  Bell,
  ArrowUpRight
} from "lucide-react";


import { useNavigate } from "react-router-dom";


// ======================================
// API BASE URL
// ======================================

const API_BASE = "http://localhost:5050";


// ======================================
// ADMIN TABS
// ======================================

const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["projects", "Projects", FolderKanban],
  ["enquiries", "Enquiries", Mail],
  ["consultations", "Consultations", CalendarDays]
];


// ======================================
// EMPTY PROJECT FORM
// ======================================

const empty = {
  title: "",
  category: "Living",
  location: "",
  year: "2026",
  image_url: ""
};

// ======================================
// MAIN ADMIN DASHBOARD
// ======================================

export default function AdminDashboard() {

  const navigate = useNavigate();

  const token = localStorage.getItem("atelier_admin_token");

  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState({
    projects: 0,
    enquiries: 0,
    consultations: 0,
    newEnquiries: 0
  });

  const [items, setItems] = useState({
    projects: [],
    enquiries: [],
    consultations: []
  });

  const [form, setForm] = useState(empty);

  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);

  const [mobile, setMobile] = useState(false);

  const [notice, setNotice] = useState(false);


  // ======================================
  // API HELPER
  // ======================================

  const api = async (path, options = {}) => {

    const response = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

          ...options.headers
        }
      }
    );


    // Session expired
    if (response.status === 401) {

      localStorage.removeItem("atelier_admin_token");

      navigate("/admin/login", {
        replace: true
      });

      throw new Error("Session expired.");
    }


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Request failed"
      );
    }


    return data;
  };


  // ======================================
  // LOAD DASHBOARD DATA
  // ======================================

  const load = async () => {

    setLoading(true);

    try {

      const [
        statsResponse,
        projectsResponse,
        enquiriesResponse,
        consultationsResponse
      ] = await Promise.all([

        api("/api/admin/stats"),

        api("/api/admin/projects"),

        api("/api/admin/enquiries"),

        api("/api/admin/consultations")
      ]);


      setStats(
        statsResponse.stats
      );


      setItems({

        projects:
          projectsResponse.items || [],

        enquiries:
          enquiriesResponse.items || [],

        consultations:
          consultationsResponse.items || []

      });

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

    } finally {

      setLoading(false);
    }
  };


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    if (!token) {

      navigate("/admin/login", {
        replace: true
      });

      return;
    }

    load();

  }, []);


  // ======================================
  // LOGOUT
  // ======================================

  const logout = async () => {

    try {

      await api(
        "/api/admin/logout",
        {
          method: "POST"
        }
      );

    } catch {

      // Ignore logout API error
    }


    localStorage.removeItem(
      "atelier_admin_token"
    );

    localStorage.removeItem(
      "atelier_admin_email"
    );


    navigate(
      "/admin/login",
      {
        replace: true
      }
    );
  };


  // ======================================
  // ADD PROJECT
  // ======================================

  const addProject = async (e) => {

    e.preventDefault();

    try {

      await api(
        "/api/admin/projects",
        {
          method: "POST",

          body: JSON.stringify(form)
        }
      );


      setForm(empty);

      setAdding(false);

      await load();

    } catch (error) {

      alert(
        error.message ||
        "Failed to create project."
      );
    }
  };


  const updateProject = async (e) => {
  e.preventDefault();

  try {
    await api(`/api/admin/projects/${editing.id}`, {
      method: "PUT",
      body: JSON.stringify(editing)
    });

    setEditing(null);
    await load();

  } catch (error) {
    alert(
      error.message ||
      "Failed to update project."
    );
  }
};

  // ======================================
  // DELETE PROJECT
  // ======================================

  const removeProject = async (id) => {

    if (
      !window.confirm(
        "Delete this project from the admin list?"
      )
    ) {
      return;
    }


    try {

      await api(
        `/api/admin/projects/${id}`,
        {
          method: "DELETE"
        }
      );


      await load();

    } catch (error) {

      alert(
        error.message ||
        "Failed to delete project."
      );
    }
  };


  // ======================================
  // RENDER
  // ======================================

  return (

    <main className="admin-shell">

      {/* ================= SIDEBAR ================= */}

      <aside
        className={
          `admin-sidebar ${mobile ? "open" : ""}`
        }
      >

        <div className="admin-side-brand">

          <span>AN</span>

          <div>

            <b>ATELIER NOIRE</b>

            <small>
              INTERIORS & ARCHITECTURE · ADMIN
            </small>

          </div>


          <button
            className="admin-mobile-close"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>

        </div>


        <div className="admin-nav">

          {tabs.map(
            ([id, label, Icon]) => (

              <button
                className={
                  tab === id
                    ? "active"
                    : ""
                }
                key={id}
                onClick={() => {

                  setTab(id);

                  setMobile(false);
                }}
              >

                <Icon size={17} />

                {label}

              </button>

            )
          )}

        </div>


        <button
          className="admin-logout"
          onClick={logout}
        >

          <LogOut size={16} />

          Logout

        </button>

      </aside>


      {/* ================= MAIN ================= */}

      <section className="admin-main">

        {/* HEADER */}

        <header className="admin-top">

          <button
            className="admin-mobile-open"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>


          <div>

            <span>
              ATELIER NOIRE / ADMIN
            </span>

            <h1>
              {
                tabs.find(
                  x => x[0] === tab
                )?.[1]
              }
            </h1>

          </div>


          <div className="admin-top-actions">

            <button
              className="notification-button"
              onClick={() =>
                setNotice(true)
              }
              aria-label="Notifications"
            >

              <Bell size={17} />

              {stats.newEnquiries > 0 && (
                <i>
                  {stats.newEnquiries}
                </i>
              )}

            </button>


            <button
              onClick={load}
              title="Refresh"
            >

              <RefreshCw size={17} />

            </button>


            <div className="admin-profile">

              <div className="admin-avatar">
                AN
              </div>

              <span>
                Admin
              </span>

            </div>

          </div>

        </header>


        {/* ================= NOTIFICATIONS ================= */}

        <AnimatePresence>

          {notice && (

            <>

              <motion.div
                className="notice-overlay"
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                exit={{
                  opacity: 0
                }}
                onClick={() =>
                  setNotice(false)
                }
              />


              <motion.aside
                className="notification-drawer"
                initial={{
                  x: "100%"
                }}
                animate={{
                  x: 0
                }}
                exit={{
                  x: "100%"
                }}
                transition={{
                  duration: 0.45,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1
                  ]
                }}
              >

                <div className="drawer-head">

                  <div>

                    <span>
                      STUDIO INBOX
                    </span>

                    <h2>
                      Notifications
                    </h2>

                  </div>


                  <button
                    onClick={() =>
                      setNotice(false)
                    }
                  >
                    <X />
                  </button>

                </div>


                {items.enquiries.length ? (

                  <div className="notice-list">

                    {items.enquiries
                      .slice(0, 8)
                      .map(x => (

                        <button
                          key={x.id}
                          onClick={() => {

                            setTab(
                              "enquiries"
                            );

                            setNotice(false);
                          }}
                        >

                          <span className="notice-dot" />

                          <div>

                            <b>
                              {x.name}
                            </b>

                            <p>
                              New enquiry
                            </p>

                            <small>
                              {formatDate(
                                x.created_at
                              )}
                            </small>

                          </div>


                          <ArrowUpRight
                            size={14}
                          />

                        </button>

                      ))}

                  </div>

                ) : (

                  <div className="drawer-empty">

                    <Bell size={24} />

                    <p>
                      No new notifications.
                    </p>

                  </div>

                )}

              </motion.aside>

            </>

          )}

        </AnimatePresence>


        {/* ================= CONTENT ================= */}

        <AnimatePresence mode="wait">

          <motion.div
            key={tab}
            className="admin-content"
            initial={{
              opacity: 0,
              y: 18
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -12
            }}
            transition={{
              duration: 0.35
            }}
          >

            {loading ? (

              <div className="admin-loading">
                Loading studio data…
              </div>

            ) : tab === "overview" ? (

              <Overview
                stats={stats}
                items={items}
              />

            ) : tab === "projects" ? (

              <Projects
  items={items.projects}
  adding={adding}
  setAdding={setAdding}
  form={form}
  setForm={setForm}
  addProject={addProject}
  removeProject={removeProject}
  editing={editing}
  setEditing={setEditing}
  updateProject={updateProject}
/>

            ) : tab === "enquiries" ? (

              <Enquiries
                items={items.enquiries}
              />

            ) : (

              <Consultations
                items={items.consultations}
              />

            )}

          </motion.div>

        </AnimatePresence>

      </section>

    </main>
  );
}


// ======================================
// DATE FORMATTER
// ======================================

function formatDate(value) {

  if (!value) {
    return "—";
  }

  return new Date(value)
    .toLocaleDateString(
      "en-IN"
    );
}


// ======================================
// OVERVIEW
// ======================================

function Overview({
  stats,
  items
}) {

  return (

    <>

      <div className="admin-welcome">

        <div>

          <span>
            GOOD MORNING
          </span>

          <h2>
            The studio, at a glance.
          </h2>

          <p>
            One place for the work,
            conversations and upcoming
            consultations.
          </p>

        </div>


        <div className="admin-date">

          {new Date().toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "long",
              year: "numeric"
            }
          )}

        </div>

      </div>


      <div className="stat-grid">

        {[
          [
            "Projects",
            stats.projects,
            "Published portfolio"
          ],

          [
            "Enquiries",
            stats.enquiries,
            "Total conversations"
          ],

          [
            "New enquiries",
            stats.newEnquiries,
            "Need attention"
          ],

          [
            "Consultations",
            stats.consultations,
            "Requests received"
          ]

        ].map(
          ([title, value, description], index) => (

            <motion.div
              className="stat-card"
              initial={{
                opacity: 0,
                y: 25
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: index * 0.08
              }}
              key={title}
            >

              <span>
                {title}
              </span>

              <strong>
                {value}
              </strong>

              <small>
                {description}
              </small>

            </motion.div>

          )
        )}

      </div>


      <div className="admin-two-col">

        {/* RECENT ENQUIRIES */}

        <section className="admin-panel">

          <div className="panel-head">

            <div>

              <span>
                RECENT ENQUIRIES
              </span>

              <h3>
                Latest conversations
              </h3>

            </div>

          </div>


          {items.enquiries
            .slice(0, 5)
            .length ? (

            items.enquiries
              .slice(0, 5)
              .map(x => (

                <div
                  className="admin-row"
                  key={x.id}
                >

                  <div className="row-avatar">

                    {x.name
                      ?.slice(0, 1)
                      || "A"}

                  </div>


                  <div>

                    <b>
                      {x.name}
                    </b>

                    <small>
                      {x.email}
                    </small>

                  </div>


                  <em>
                    {formatDate(
                      x.created_at
                    )}
                  </em>

                </div>

              ))

          ) : (

            <p className="empty-state">
              No enquiries yet.
            </p>

          )}

        </section>


        {/* RECENT PROJECTS */}

        <section className="admin-panel">

          <div className="panel-head">

            <div>

              <span>
                RECENT PROJECTS
              </span>

              <h3>
                Portfolio library
              </h3>

            </div>

          </div>


          {items.projects
            .slice(0, 5)
            .map(x => (

              <div
                className="admin-row"
                key={x.id}
              >

                <div className="project-dot" />

                <div>

                  <b>
                    {x.title}
                  </b>

                  <small>
                    {x.category} ·{" "}
                    {x.location}
                  </small>

                </div>


                <em>
                  {formatDate(
                    x.created_at
                  )}
                </em>

              </div>

            ))}

        </section>

      </div>

    </>
  );
}


// ======================================
// PROJECTS
// ======================================

function Projects({
  items,
  adding,
  setAdding,
  form,
  setForm,
  addProject,
  removeProject,
  editing,
  setEditing,
  updateProject
}) {
  return (

    <>

      <div className="admin-toolbar">

        <div>

          <span>
            PORTFOLIO LIBRARY
          </span>

          <p>
            Manage the studio's
            project catalogue.
          </p>

        </div>


        <button
          className="admin-primary"
          onClick={() =>
            setAdding(v => !v)
          }
        >

          <Plus size={16} />

          {adding
            ? "Close"
            : "Add project"}

        </button>

      </div>


      {adding && (

        <motion.form
          className="admin-add-form"
          onSubmit={addProject}
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: "auto",
            opacity: 1
          }}
        >

          <input
            placeholder="Project title"
            value={form.title}
            onChange={e =>
              setForm({
                ...form,
                title: e.target.value
              })
            }
            required
          />


          <select
            value={form.category}
            onChange={e =>
              setForm({
                ...form,
                category: e.target.value
              })
            }
          >

            <option>
              Living
            </option>

            <option>
              Bedroom
            </option>

            <option>
              Kitchen
            </option>

            <option>
              Dining
            </option>

          </select>


          <input
            placeholder="Location"
            value={form.location}
            onChange={e =>
              setForm({
                ...form,
                location: e.target.value
              })
            }
            required
          />


          <input
            placeholder="Year"
            value={form.year}
            onChange={e =>
              setForm({
                ...form,
                year: e.target.value
              })
            }
          />

        <input
  placeholder="Image URL"
  value={form.image_url || ""}
  onChange={e =>
    setForm({
      ...form,
      image_url: e.target.value
    })
  }
/>

          <button className="admin-primary">
            Save project
          </button>

        </motion.form>

      )}
        {editing && (
  <motion.form
    className="admin-add-form"
    onSubmit={updateProject}
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
  >
    <input
      placeholder="Project title"
      value={editing.title}
      onChange={e =>
        setEditing({
          ...editing,
          title: e.target.value
        })
      }
      required
    />

    <select
      value={editing.category}
      onChange={e =>
        setEditing({
          ...editing,
          category: e.target.value
        })
      }
    >
      <option>Living</option>
      <option>Bedroom</option>
      <option>Kitchen</option>
      <option>Dining</option>
    </select>

    <input
      placeholder="Location"
      value={editing.location}
      onChange={e =>
        setEditing({
          ...editing,
          location: e.target.value
        })
      }
      required
    />

    <input
      placeholder="Year"
      value={editing.year}
      onChange={e =>
        setEditing({
          ...editing,
          year: e.target.value
        })
      }
    />
<input
  placeholder="Image URL"
  value={editing.image_url || ""}
  onChange={e =>
    setEditing({
      ...editing,
      image_url: e.target.value
    })
  }
/>
    <button
      type="submit"
      className="admin-primary"
    >
      Update project
    </button>

    <button
      type="button"
      onClick={() => setEditing(null)}
    >
      Cancel
    </button>
  </motion.form>
)}



      <section className="admin-panel table-panel">

        <table>

          <thead>

            <tr>

              <th>
                Project
              </th>

              <th>
                Category
              </th>

              <th>
                Location
              </th>

              <th>
                Year
              </th>

              <th>
                Status
              </th>

              <th />

            </tr>

          </thead>


          <tbody>

            {items.map(x => (

              <tr key={x.id}>

                <td>
                  <b>
                    {x.title}
                  </b>
                </td>

                <td>
                  {x.category}
                </td>

                <td>
                  {x.location}
                </td>

                <td>
                  {new Date(
                    x.created_at
                  ).getFullYear()}
                </td>

                <td>

                  <span className="status-pill">
                    Published
                  </span>

                </td>

                <td>

                  <button
  className="icon-button"
  onClick={() =>
   setEditing({
  id: x.id,
  title: x.title || "",
  category: x.category || "Living",
  location: x.location || "",
  year: x.year || "",
  image_url: x.image_url || ""
})
  }
  title="Edit project"
>
  <Pencil size={15} />
</button>

<button
  className="icon-danger"
  onClick={() =>
    removeProject(x.id)
  }
  title="Delete project"
>
  <Trash2 size={15} />
</button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

    </>

  );
}


// ======================================
// ENQUIRIES
// ======================================

function Enquiries({
  items
}) {

  return (

    <section className="admin-panel table-panel">

      <div className="panel-head">

        <div>

          <span>
            CONTACT FORM
          </span>

          <h3>
            Project enquiries
          </h3>

        </div>

      </div>


      {items.length ? (

        <table>

          <thead>

            <tr>

              <th>
                Client
              </th>

              <th>
                Contact
              </th>

              <th>
                Message
              </th>

              <th>
                Received
              </th>

            </tr>

          </thead>


          <tbody>

            {items.map(x => (

              <tr key={x.id}>

                <td>

                  <b>
                    {x.name}
                  </b>

                  <small>
                    #{x.id}
                  </small>

                </td>


                <td>

                  {x.email}

                  <br />

                  {x.phone}

                </td>


                <td>

                  {x.message || "—"}

                </td>


                <td>

                  {new Date(
                    x.created_at
                  ).toLocaleString(
                    "en-IN"
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      ) : (

        <p className="empty-state">
          No enquiries yet.
        </p>

      )}

    </section>

  );
}


// ======================================
// CONSULTATIONS
// ======================================

function Consultations({
  items
}) {

  return (

    <section className="admin-panel table-panel">

      <div className="panel-head">

        <div>

          <span>
            BOOKING REQUESTS
          </span>

          <h3>
            Consultations
          </h3>

        </div>

      </div>


      {items.length ? (

        <table>

          <thead>

            <tr>

              <th>
                Client
              </th>

              <th>
                Date
              </th>

              <th>
                Time
              </th>

              <th>
                Mode
              </th>

              <th>
                Contact
              </th>

            </tr>

          </thead>


          <tbody>

            {items.map(x => (

              <tr key={x.id}>

                <td>

                  <b>
                    {x.name}
                  </b>

                  <small>
                    #{x.id}
                  </small>

                </td>


                <td>

                  {x.preferred_date
                    ? new Date(
                        x.preferred_date
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "—"}

                </td>


                <td>

                  {x.preferred_time ||
                    "—"}

                </td>


                <td>

                  {x.message ||
                    "Video consultation"}

                </td>


                <td>

                  {x.email}

                  <br />

                  {x.phone}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      ) : (

        <p className="empty-state">
          No consultation requests yet.
        </p>

      )}

    </section>

  );
}