import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import authService from "../services/authService"
import { toast } from "react-toastify"
import { ArrowLeft, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

function ChangePassword() {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const isDark = theme === "dark"
    const bgColor = isDark ? "bg-gray-800" : "bg-white"
    const textColor = isDark ? "text-gray-100" : "text-gray-800"
    const borderColor = isDark ? "border-gray-700" : "border-gray-200"
    const secondaryText = isDark ? "text-gray-400" : "text-gray-500"
    const inputBg = isDark ? "bg-gray-700" : "bg-gray-50"
    const inputBorder = isDark ? "border-gray-600" : "border-gray-300"

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Current password is required"
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required"
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters long"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password"
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = "New password must be different from current password"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            await authService.changePassword({
                old_password: formData.currentPassword,
                new_password: formData.newPassword,
                new_password_confirm: formData.confirmPassword,
            })
            toast.success("Password changed successfully!")
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setTimeout(() => {
                authService.logout()
            }, 1500)
        } catch (error) {
            if (error.response?.status === 400) {
                setErrors({
                    currentPassword: "Current password is incorrect"
                })
            } else {
                toast.error(error.response?.data?.detail || "Failed to change password")
            }
        } finally {
            setLoading(false)
        }
    }

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" }

        let strength = 0
        if (password.length >= 8) strength += 1
        if (/[A-Z]/.test(password)) strength += 1
        if (/[a-z]/.test(password)) strength += 1
        if (/[0-9]/.test(password)) strength += 1
        if (/[^A-Za-z0-9]/.test(password)) strength += 1

        const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
        const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

        return {
            strength,
            label: strengthLabels[strength - 1] || "",
            color: strengthColors[strength - 1] || "bg-gray-300"
        }
    }

    const passwordStrength = getPasswordStrength(formData.newPassword)

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate("/settings")}
                        className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors mr-4`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-bold ${textColor}`}>Change Password</h1>
                        <p className={secondaryText}>Update your account password</p>
                    </div>
                </div>

                {/* Form */}
                <div className={`${bgColor} rounded-xl shadow-sm p-8 border ${borderColor}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password fields */}
                        {["currentPassword", "newPassword", "confirmPassword"].map((fieldKey) => {
                            const fieldLabel = {
                                currentPassword: "Current Password",
                                newPassword: "New Password",
                                confirmPassword: "Confirm New Password"
                            }[fieldKey]

                            return (
                                <div key={fieldKey}>
                                    <label className={`block text-sm font-medium ${secondaryText} mb-2`}>
                                        {fieldLabel}
                                    </label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-2.5 w-5 h-5 ${secondaryText}`} />
                                        <input
                                            type={showPasswords[fieldKey.replace("Password", "")] ? "text" : "password"}
                                            name={fieldKey}
                                            value={formData[fieldKey]}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-12 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor} ${errors[fieldKey] ? "border-red-500" : ""
                                                }`}
                                            placeholder={`Enter your ${fieldLabel.toLowerCase()}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility(fieldKey.replace("Password", ""))}
                                            className={`absolute right-3 top-2.5 ${secondaryText} hover:${textColor} transition-colors`}
                                        >
                                            {showPasswords[fieldKey.replace("Password", "")] ? (
                                                <Eye className="w-5 h-5" />
                                            ) : (
                                                <EyeOff className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors[fieldKey] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[fieldKey]}</p>
                                    )}
                                    {fieldKey === "newPassword" && formData.newPassword && (
                                        <div className="mt-2">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium ${secondaryText}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className={`text-xs ${secondaryText} space-y-1`}>
                                                <p>Password should contain:</p>
                                                <ul className="list-disc list-inside space-y-0.5 ml-2">
                                                    <li className={formData.newPassword.length >= 8 ? "text-green-500" : ""}>
                                                        At least 8 characters
                                                    </li>
                                                    <li className={/[A-Z]/.test(formData.newPassword) ? "text-green-500" : ""}>
                                                        Uppercase letter (A-Z)
                                                    </li>
                                                    <li className={/[a-z]/.test(formData.newPassword) ? "text-green-500" : ""}>
                                                        Lowercase letter (a-z)
                                                    </li>
                                                    <li className={/[0-9]/.test(formData.newPassword) ? "text-green-500" : ""}>
                                                        Number (0-9)
                                                    </li>
                                                    <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? "text-green-500" : ""}>
                                                        Special character (!@#$%^&*)
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Submit & Cancel */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard/settings")} // ✅ correct path

                                className={`px-6 py-2 rounded-lg border ${borderColor} ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default ChangePassword
