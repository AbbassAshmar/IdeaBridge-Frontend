import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import AppLayout from "../components/AppLayout";
import FormMessage from "../components/FormMessage";
import InputField from "../components/InputField";
import { useAuth } from "../hooks/useAuth";
import { getCategories } from "../services/api/categories";
import { createIdea } from "../services/api/ideas";
import { getErrorMessage, getValidationErrors } from "../services/api/client";
import { isDeveloper } from "../utils/userRoles";

function CreateIdeaPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createMessageType, setCreateMessageType] = useState("success");
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
  });

  const blockedForDevelopers = useMemo(() => isDeveloper(user), [user]);

  useEffect(() => {
    if (!user || blockedForDevelopers) {
      return;
    }

    let isActive = true;

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCreateMessage("");
        const response = await getCategories();

        if (!isActive) {
          return;
        }

        setCategories(response?.data?.categories ?? []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setCreateMessage(getErrorMessage(error, "Failed to load categories."));
        setCreateMessageType("error");
      } finally {
        if (isActive) {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isActive = false;
    };
  }, [blockedForDevelopers, user]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateIdea = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateMessage("");
    setCreateMessageType("success");
    setCreateErrors({});

    try {
      const payload = {
        category_id: formData.category_id ? Number(formData.category_id) : null,
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      await createIdea(payload);
      setFormData({
        category_id: "",
        title: "",
        description: "",
      });
      setCreateMessage("Idea created successfully.");
      setCreateMessageType("success");
    } catch (error) {
      setCreateMessage(getErrorMessage(error, "Failed to create idea."));
      setCreateMessageType("error");
      setCreateErrors(getValidationErrors(error));
    } finally {
      setIsCreating(false);
    }
  };

  if (blockedForDevelopers) {
    return <Navigate to="/ideas" replace />;
  }

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark">
          <div className="flex items-center gap-3 text-content-primary">
            <Lightbulb size={20} className="text-warning" />
            <h1 className="text-3xl font-semibold">Create a new idea</h1>
          </div>
          <p className="mt-2 text-sm text-content-tertiary">
            Share your idea with developers and the community.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleCreateIdea}>
            <div>
              <label
                htmlFor="category_id"
                className="mb-2 block text-sm text-content-tertiary"
              >
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleFormChange}
                className={`w-full rounded-card border bg-surface-base px-3 py-3 text-sm text-content-primary outline-none transition focus:border-accent-400 focus:bg-surface-dim focus:ring-2 focus:ring-accent-400/30 ${
                  createErrors.category_id ? "border-danger" : "border-ui-border"
                }`}
                disabled={isLoadingCategories}
              >
                <option value="">
                  {isLoadingCategories ? "Loading categories..." : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 min-h-[18px] text-xs text-danger">
                {createErrors.category_id || ""}
              </p>
            </div>

            <InputField
              id="title"
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Add keyboard shortcuts"
              error={createErrors.title}
            />

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm text-content-tertiary"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Allow quick navigation between sections with shortcuts."
                rows={5}
                className={`w-full rounded-card border bg-surface-base px-3 py-3 text-sm text-content-primary outline-none transition placeholder:text-content-tertiary focus:border-accent-400 focus:bg-surface-dim focus:ring-2 focus:ring-accent-400/30 ${
                  createErrors.description ? "border-danger" : "border-ui-border"
                }`}
              />
              <p className="mt-1.5 min-h-[18px] text-xs text-danger">
                {createErrors.description || ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center justify-center rounded-lg border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-5 py-2.5 text-sm font-semibold text-content-inverse transition hover:-translate-y-0.5 hover:shadow-glow-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create idea"}
              </button>
              <FormMessage message={createMessage} type={createMessageType} />
            </div>
          </form>
        </div>
      </section>
    </AppLayout>
  );
}

export default CreateIdeaPage;
