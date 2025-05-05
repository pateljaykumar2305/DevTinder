const validateSignup = (data) => {
    const errors = [];

    if (!data.firstName || data.firstName.trim() === '') {
        errors.push('First name is required');
    }
    if (!data.lastName || data.lastName.trim() === '') {
        errors.push('Last name is required');
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.push('Valid email is required');
    }
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    if (!data.phone || !/^\d{10}$/.test(data.phone)) {
        errors.push('Valid phone number is required');
    }
    if (!data.age || data.age < 18) {
        errors.push('Age must be 18 or older');
    }

    return errors;
};

module.exports = validateSignup;