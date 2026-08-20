import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useSignUp } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const stateOptions = [
  {
    value: 'maharashtra',
    label: 'Maharashtra',
    cities: {
      mumbai: ['NMIMS', 'SP Jain', 'KJ Somaiya'],
      pune: ['MIT WPU', 'Savitribai Phule Pune University', 'VIT Pune'],
      nagpur: ['RTMNU', 'YCCE', 'G H Raisoni'],
      nashik: ['K K Wagh', 'Sandip University', 'SRTMU'],
      aurangabad: ['Dr. BAMU', 'MGM College', 'Deogiri College'],
    },
  },
  {
    value: 'delhi',
    label: 'Delhi',
    cities: {
      'new-delhi': ['Delhi University', 'DTU', 'Indira Gandhi Delhi Technical University'],
      gurugram: ['The Heritage Academy', 'Apex University', 'Gurugram University'],
      noida: ['Amity University', 'Sharda University', 'Delhi Technical Campus'],
    },
  },
  {
    value: 'karnataka',
    label: 'Karnataka',
    cities: {
      bengaluru: ['BMSCE', 'RV College', 'NITTE'],
      mysuru: ['University of Mysore', 'JSS Science & Technology', 'Mysore Institute'],
      mangaluru: ['St. Aloysius', 'NITTE', 'Canara College'],
      hubballi: ['KLE Tech', 'KUD', 'BVB College'],
    },
  },
  {
    value: 'tamil-nadu',
    label: 'Tamil Nadu',
    cities: {
      chennai: ['SRM', 'VIT Chennai', 'Anna University'],
      coimbatore: ['PSG Tech', 'Karunya', 'Bharathiar University'],
      madurai: ['Thiagarajar College', 'Madurai Kamaraj University', 'Mepco Schlenk'],
    },
  },
  {
    value: 'telangana',
    label: 'Telangana',
    cities: {
      hyderabad: ['BITS Pilani Hyderabad', 'IIIT Hyderabad', 'Osmania University'],
      warangal: ['Kakatiya University', 'NIT Warangal', 'SR Engineering College'],
    },
  },
  {
    value: 'west-bengal',
    label: 'West Bengal',
    cities: {
      kolkata: ['Jadavpur University', 'IIT Kharagpur', 'St. Xavier\'s'],
      'durgapur': ['NIT Durgapur', 'Brainware University', 'Durgapur Institute'],
    },
  },
]

const initialForm = {
  account: {
    fullName: '',
    email: '',
    phone: '',
    password: '',
  },
  education: {
    state: '',
    city: '',
    college: '',
    course: '',
    graduationYear: '',
  },
  profile: {
    dob: '',
    gender: '',
    interests: [],
  },
  otp: {
    code: '',
  },
}

const stepMeta = [
  { key: 'account', title: 'Account', subtitle: 'Create your login details' },
  { key: 'education', title: 'Campus', subtitle: 'Tell us where you study' },
  { key: 'profile', title: 'Profile', subtitle: 'Add a few personal details' },
  { key: 'otp', title: 'Verify', subtitle: 'Confirm your identity' },
]

const interestOptions = ['Events', 'Networking', 'Hackathons', 'Travel', 'Fitness', 'Music']

function getAge(dateString) {
  if (!dateString) return 0
  const birth = new Date(dateString)
  if (Number.isNaN(birth.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

function validateField(group, field, value) {
  const trimmed = typeof value === 'string' ? value.trim() : value

  if (field === 'fullName') {
    if (!trimmed) return 'Full name is required.'
    if (trimmed.length < 2) return 'Please enter at least 2 characters.'
    return ''
  }

  if (field === 'email') {
    if (!trimmed) return 'Email is required.'
    if (/\s/.test(trimmed)) return 'Email cannot contain spaces.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.'
    return ''
  }

  if (field === 'phone') {
    if (!trimmed) return 'Mobile number is required.'
    if (!/^\d+$/.test(trimmed)) return 'Mobile number must contain numbers only.'
    if (trimmed.length < 10) return 'Mobile number must be at least 10 digits.'
    return ''
  }

  if (field === 'password') {
    if (!trimmed) return 'Password is required.'
    return ''
  }

  if (field === 'state') {
    if (!trimmed) return 'Please select your state.'
    return ''
  }

  if (field === 'city') {
    if (!trimmed) return 'Please select your city.'
    return ''
  }

  if (field === 'college') {
    if (!trimmed) return 'Please select your college.'
    return ''
  }

  if (field === 'course') {
    if (!trimmed) return 'Course is required.'
    if (trimmed.length < 2) return 'Course name is too short.'
    return ''
  }

  if (field === 'graduationYear') {
    if (!trimmed) return 'Select your graduation year.'
    const year = Number(trimmed)
    if (Number.isNaN(year)) return 'Graduation year must be numeric.'
    if (year < 2024 || year > 2035) return 'Year should be between 2024 and 2035.'
    return ''
  }

  if (field === 'dob') {
    if (!trimmed) return 'Date of birth is required.'
    const age = getAge(trimmed)
    if (age < 16) return 'You must be at least 16 years old.'
    if (age > 35) return 'Please enter a valid age.'
    return ''
  }

  if (field === 'gender') {
    if (!trimmed) return 'Please select your gender.'
    return ''
  }

  if (field === 'interests') {
    if (!value || value.length === 0) return 'Select at least one interest.'
    return ''
  }

  if (field === 'otp') {
    if (!trimmed) return 'OTP is required.'
    if (!/^\d{6}$/.test(trimmed)) return 'OTP must be a 6-digit code.'
    return ''
  }

  return ''
}

function getStepErrorMap(step, data) {
  if (step === 0) {
    return {
      fullName: validateField('account', 'fullName', data.account.fullName),
      email: validateField('account', 'email', data.account.email),
      phone: validateField('account', 'phone', data.account.phone),
      password: validateField('account', 'password', data.account.password),
    }
  }

  if (step === 1) {
    return {
      state: validateField('education', 'state', data.education.state),
      city: validateField('education', 'city', data.education.city),
      college: validateField('education', 'college', data.education.college),
      course: validateField('education', 'course', data.education.course),
      graduationYear: validateField('education', 'graduationYear', data.education.graduationYear),
    }
  }

  if (step === 2) {
    return {
      dob: validateField('profile', 'dob', data.profile.dob),
      gender: validateField('profile', 'gender', data.profile.gender),
      interests: validateField('profile', 'interests', data.profile.interests),
    }
  }

  return {
    otp: validateField('otp', 'otp', data.otp.code),
  }
}

function App() {
  const { signUp } = useSignUp()
  const [screen, setScreen] = useState('landing')
  const [wizardStep, setWizardStep] = useState(0)
  const [formData, setFormData] = useState(initialForm)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [resendCountdown, setResendCountdown] = useState(30)

  const selectedState = useMemo(
    () => stateOptions.find((option) => option.value === formData.education.state),
    [formData.education.state],
  )

  const cityOptions = selectedState ? Object.keys(selectedState.cities) : []
  const collegeOptions =
    selectedState && formData.education.city ? selectedState.cities[formData.education.city] : []

  useEffect(() => {
    if (screen !== 'wizard' || wizardStep !== 3 || resendCountdown <= 0) return

    const interval = setInterval(() => {
      setResendCountdown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [screen, wizardStep, resendCountdown])

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(timeout)
  }, [toast])

  const showToast = (message, type = 'error') => setToast({ message, type })

  const setFieldValue = (group, field, value) => {
    setFormData((previous) => {
      const next = {
        ...previous,
        [group]: {
          ...previous[group],
          [field]: value,
        },
      }

      if (group === 'education' && field === 'state') {
        next.education.city = ''
        next.education.college = ''
      }

      if (group === 'education' && field === 'city') {
        next.education.college = ''
      }

      return next
    })

    setTouched((previous) => ({ ...previous, [field]: true }))

    if (field === 'interests') {
      const nextError = validateField(group, field, value)
      setErrors((previous) => ({ ...previous, [field]: nextError }))
      return
    }

    const nextError = validateField(group, field, value)
    setErrors((previous) => ({ ...previous, [field]: nextError }))
  }

  const validateCurrentStep = () => {
    const stepErrors = getStepErrorMap(wizardStep, formData)
    const nextErrors = {}
    let hasError = false

    Object.entries(stepErrors).forEach(([field, message]) => {
      if (message) {
        nextErrors[field] = message
        hasError = true
      }
    })

    setErrors((previous) => ({ ...previous, ...nextErrors }))
    return !hasError
  }

  const sendOtp = async () => {
    await signUp.create({
      emailAddress: formData.account.email,
      password: formData.account.password,
      firstName: formData.account.fullName,
    })

    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
  }

  const handleContinue = async () => {
    if (loading) return

    const isValid = validateCurrentStep()
    if (!isValid) {
      showToast('Please fix the highlighted fields and try again.', 'error')
      return
    }

    if (wizardStep === 2) {
      setLoading(true)
      try {
        await sendOtp()
        setResendCountdown(30)
        setFormData((previous) => ({ ...previous, otp: { ...previous.otp, code: '' } }))
        setErrors((previous) => ({ ...previous, otp: '' }))
        setWizardStep(3)
        setLoading(false)
        showToast(`A verification code was sent to ${formData.account.email}.`, 'success')
      } catch (error) {
        showToast(error.message, 'error')
      } finally {
        setLoading(false)
      }
      return
    }

    if (wizardStep === 3) {
      const enteredCode = formData.otp.code.trim()

      setLoading(true)
      signUp.attemptEmailAddressVerification({ code: enteredCode })
        .then(() => {
          setErrors((previous) => ({ ...previous, otp: '' }))
          setScreen('success')
        })
        .catch((error) => {
          setOtpAttempts((value) => value + 1)
          setErrors((previous) => ({ ...previous, otp: error.message }))
          showToast(error.message, 'error')
        })
        .finally(() => {
          setLoading(false)
        })
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setWizardStep((step) => step + 1)
      setLoading(false)
    }, 800)
  }

  const handleBack = () => {
    if (wizardStep === 0) {
      setScreen('landing')
      return
    }
    setWizardStep((step) => Math.max(step - 1, 0))
  }

  const handleExitSignup = () => {
    setScreen('landing')
  }

  const handleStepNavigation = (step) => {
    if (loading || step > wizardStep) return
    setErrors({})
    setWizardStep(step)
  }

  const goToTerms = () => {
    setScreen('terms')
  }

  const handleLogin = () => {
    showToast('Demo login is available in this frontend-only flow.', 'success')
  }

  const handleLearnMore = () => {
    setScreen('learn-more')
  }

  const startSignup = () => {
    setScreen('wizard')
    setWizardStep(0)
  }

  const acceptTerms = () => {
    if (!termsAccepted) {
      showToast('Please accept the Terms & Conditions before continuing.', 'error')
      return
    }

    setScreen('wizard')
    setWizardStep(0)
  }

  const resendOtp = async () => {
    if (resendCountdown > 0) return
    setLoading(true)
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setFormData((previous) => ({ ...previous, otp: { ...previous.otp, code: '' } }))
      setErrors((previous) => ({ ...previous, otp: '' }))
      setOtpAttempts(0)
      setResendCountdown(30)
      showToast(`A new verification code was sent to ${formData.account.email}.`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (interest) => {
    const current = new Set(formData.profile.interests)
    if (current.has(interest)) {
      current.delete(interest)
    } else {
      current.add(interest)
    }

    const nextValue = [...current]
    setFieldValue('profile', 'interests', nextValue)
  }

  const renderFieldError = (field) => {
    if (!(field in errors) || !errors[field]) return null
    return <span className="field-error">{errors[field]}</span>
  }

  const renderLanding = () => (
    <div className="page-shell landing-page">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">N</div>
          <span>Nubpack</span>
        </div>
        <SignedOut>
          <SignInButton mode="modal">
            <button type="button" className="ghost-button small-button" onClick={handleLogin}>
              Login
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </header>

      <main className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Make real connections</p>
          <h1>Meet people who match your vibe and campus life.</h1>
          <p className="subtext">
            Discover events, make friends, and build a social circle that feels familiar,
            fun, and authentic.
          </p>
          <div className="cta-row">
            <button type="button" className="primary-button" onClick={goToTerms}>
              Create account
            </button>
            <button type="button" className="secondary-button" onClick={handleLearnMore}>
              Learn more
            </button>
          </div>
          <div className="stats-row">
            <div>
              <strong>12k+</strong>
              <span>Active students</span>
            </div>
            <div>
              <strong>850</strong>
              <span>Events this month</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>User rating</span>
            </div>
          </div>
        </div>

        <div className="phone-demo" aria-label="Application preview">
          <div className="phone-topbar" />
          <div className="mini-card hero-card">
            <div className="mini-header">
              <span>Campus match</span>
              <span className="chat-tag">Online</span>
            </div>
            <div className="avatar-row">
              <span className="avatar gold">A</span>
              <span className="avatar orange">S</span>
              <span className="avatar purple">M</span>
            </div>
            <div className="match-card">
              <strong>92% Match</strong>
              <p>Shared interest in music, startups & nightlife.</p>
            </div>
          </div>
          <div className="mini-card event-card">
            <div className="event-row">
              <span className="event-date">12 Aug</span>
              <span className="event-pill">Live</span>
            </div>
            <h3>Sunset Mixer</h3>
            <p>Meet fresh faces from your city.</p>
          </div>
        </div>
      </main>
    </div>
  )

  const renderTerms = () => (
    <div className="page-shell legal-page">
      <div className="legal-card">
        <div className="back-row">
          <button type="button" className="back-link" onClick={() => setScreen('landing')}>
            ← Back
          </button>
        </div>
        <div className="page-heading">
          <p className="eyebrow">Welcome to Nubpack</p>
          <h2>Terms & Conditions</h2>
        </div>

        <div className="terms-box">
          <p>
            By creating an account, you agree to use Nubpack responsibly and to maintain the integrity of
            conversations, events, and communities. You confirm that you are at least 16 years of age and you
            will not share harmful, abusive, or misleading content.
          </p>
          <ul>
            <li>We use your minimal profile details to personalize suggested matches and events.</li>
            <li>Location and college data help improve local community recommendations.</li>
            <li>Accounts may be moderated for policy violations or unsafe behavior.</li>
            <li>Any promotional activity should remain respectful and consent-based.</li>
            <li>We may update service terms to improve user security and product experience.</li>
          </ul>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
          />
          <span className="checkbox-text">I agree to the Terms & Conditions and Privacy Policy.</span>
        </label>

        <button type="button" className="primary-button full-width" onClick={acceptTerms} disabled={!termsAccepted}>
          Continue
        </button>
      </div>
    </div>
  )

  const renderLearnMore = () => (
    <div className="page-shell legal-page">
      <div className="legal-card learn-more-card">
        <div className="back-row">
          <button type="button" className="back-link" onClick={() => setScreen('landing')}>
            ← Back
          </button>
        </div>

        <div className="page-heading">
          <p className="eyebrow">Why Nubpack</p>
          <h2>Build your campus circle</h2>
        </div>

        <div className="terms-box learn-more-box">
          <p>
            Nubpack helps students discover people, events, and communities that match their vibe. Instead of
            random social noise, you get relevant matches based on your campus, interests, and lifestyle.
          </p>
          <ul>
            <li>Meet people who share your interests, event preferences, and campus energy.</li>
            <li>Join community events, mixers, and social meets curated around your city and college.</li>
            <li>Stay connected with friends, classmates, and new people in a safe and friendly space.</li>
            <li>Turn campus life into meaningful friendships, collaborations, and unforgettable experiences.</li>
          </ul>
        </div>

        <button type="button" className="primary-button full-width" onClick={() => setScreen('landing')}>
          Go to home
        </button>
      </div>
    </div>
  )

  const renderWizard = () => {
    const currentStep = stepMeta[wizardStep]
    const stateList = stateOptions.map((option) => ({ value: option.value, label: option.label }))
    const graduationOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035']

    return (
      <div className="page-shell wizard-shell">
        <div className="wizard-card">
          <div className="wizard-header">
            <div className="brand-wrap compact-brand">
              <div className="brand-mark">N</div>
              <span>Nubpack</span>
            </div>
            <div className="progress-meta">
              <span className="step-counter">
                Step {wizardStep + 1} of {stepMeta.length}
              </span>
            </div>
          </div>

          <div className="stepper" aria-label="Signup progress">
            {stepMeta.map((step, index) => (
              <button
                type="button"
                key={step.key}
                className={`step-dot ${index === wizardStep ? 'active' : index < wizardStep ? 'done' : ''}`}
                aria-current={index === wizardStep ? 'step' : undefined}
                aria-label={`Go to ${step.title} step`}
                onClick={() => handleStepNavigation(index)}
                disabled={loading || index > wizardStep}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="title-wrap">
            <p className="eyebrow">{currentStep.subtitle}</p>
            <h2>{currentStep.title}</h2>
          </div>

          {wizardStep === 0 && (
            <div className="form-grid two-up">
              <div className="field-wrap">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.account.fullName}
                  onChange={(event) => setFieldValue('account', 'fullName', event.target.value)}
                  onBlur={() => setTouched((previous) => ({ ...previous, fullName: true }))}
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(errors.fullName)}
                />
                {renderFieldError('fullName')}
              </div>

              <div className="field-wrap">
                <label htmlFor="phone">Mobile number</label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={formData.account.phone}
                  onChange={(event) => {
                    const sanitized = event.target.value.replace(/\D/g, '').slice(0, 10)
                    setFieldValue('account', 'phone', sanitized)
                  }}
                  placeholder="10-digit mobile number"
                  aria-invalid={Boolean(errors.phone)}
                />
                {renderFieldError('phone')}
              </div>

              <div className="field-wrap full-width">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={formData.account.email}
                  onChange={(event) => setFieldValue('account', 'email', event.target.value)}
                  onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
                  placeholder="name@example.com"
                  aria-invalid={Boolean(errors.email)}
                />
                {renderFieldError('email')}
              </div>

              <div className="field-wrap full-width">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={formData.account.password}
                  onChange={(event) => setFieldValue('account', 'password', event.target.value)}
                  placeholder="Enter a password"
                  aria-invalid={Boolean(errors.password)}
                />
                {renderFieldError('password')}
              </div>
            </div>
          )}

          {wizardStep === 1 && (
            <div className="form-grid two-up">
              <div className="field-wrap">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  value={formData.education.state}
                  onChange={(event) => setFieldValue('education', 'state', event.target.value)}
                  aria-invalid={Boolean(errors.state)}
                >
                  <option value="">Select state</option>
                  {stateList.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {renderFieldError('state')}
              </div>

              <div className="field-wrap">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  value={formData.education.city}
                  onChange={(event) => setFieldValue('education', 'city', event.target.value)}
                  disabled={!selectedState}
                  aria-invalid={Boolean(errors.city)}
                >
                  <option value="">Select city</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {renderFieldError('city')}
              </div>

              <div className="field-wrap full-width">
                <label htmlFor="college">College</label>
                <select
                  id="college"
                  value={formData.education.college}
                  onChange={(event) => setFieldValue('education', 'college', event.target.value)}
                  disabled={!formData.education.city}
                  aria-invalid={Boolean(errors.college)}
                >
                  <option value="">Select college</option>
                  {collegeOptions.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
                {renderFieldError('college')}
              </div>

              <div className="field-wrap">
                <label htmlFor="course">Course</label>
                <input
                  id="course"
                  type="text"
                  value={formData.education.course}
                  onChange={(event) => setFieldValue('education', 'course', event.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  aria-invalid={Boolean(errors.course)}
                />
                {renderFieldError('course')}
              </div>

              <div className="field-wrap">
                <label htmlFor="graduationYear">Graduation year</label>
                <select
                  id="graduationYear"
                  value={formData.education.graduationYear}
                  onChange={(event) => setFieldValue('education', 'graduationYear', event.target.value)}
                  aria-invalid={Boolean(errors.graduationYear)}
                >
                  <option value="">Select year</option>
                  {graduationOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {renderFieldError('graduationYear')}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="form-grid two-up">
              <div className="field-wrap full-width">
                <label htmlFor="dob">Date of birth</label>
                <input
                  id="dob"
                  type="date"
                  value={formData.profile.dob}
                  onChange={(event) => setFieldValue('profile', 'dob', event.target.value)}
                  aria-invalid={Boolean(errors.dob)}
                />
                {renderFieldError('dob')}
              </div>

              <div className="field-wrap full-width">
                <label>Gender</label>
                <div className="segmented-row" role="radiogroup" aria-label="Gender selection">
                  {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`segment-button ${formData.profile.gender === option ? 'selected' : ''}`}
                      onClick={() => setFieldValue('profile', 'gender', option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {renderFieldError('gender')}
              </div>

              <div className="field-wrap full-width">
                <label>Interests</label>
                <div className="chip-grid">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={`chip ${formData.profile.interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {renderFieldError('interests')}
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="otp-panel">
              <div className="otp-summary">
                <span className="otp-badge">Secure check</span>
                <p>
                  We sent a verification code to <strong>{formData.account.email || 'your email address'}</strong>.
                </p>
              </div>

              <div className="field-wrap full-width">
                <label htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  disabled={false}
                  value={formData.otp.code}
                  onChange={(event) => {
                    const sanitized = event.target.value.replace(/\D/g, '').slice(0, 6)
                    setFieldValue('otp', 'code', sanitized)
                  }}
                  placeholder="Enter 6-digit OTP"
                  aria-invalid={Boolean(errors.otp)}
                />
                {renderFieldError('otp')}
              </div>

              <div className="otp-meta-row">
                <button type="button" className="link-button" onClick={resendOtp} disabled={resendCountdown > 0}>
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                </button>
              </div>

              {otpAttempts > 0 && (
                <p className="helper-copy">
                  Wrong code submitted {otpAttempts} time{otpAttempts > 1 ? 's' : ''}. Check your email and try again.
                </p>
              )}
            </div>
          )}

          <div className="button-row">
            <button type="button" className="secondary-button" onClick={handleBack} disabled={loading}>
              Back
            </button>
            <button type="button" className="back-link" onClick={handleExitSignup} disabled={loading}>
              Back to home
            </button>
            <button type="button" className="primary-button" onClick={handleContinue} disabled={loading}>
              {loading ? 'Please wait...' : wizardStep === 3 ? 'Verify & continue' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSuccess = () => (
    <div className="page-shell success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <p className="eyebrow">Registration complete</p>
        <h2>Your profile is ready.</h2>
        <p className="success-copy">
          Welcome aboard, {formData.account.fullName || 'friend'}. Your Nubpack profile has been created successfully.
        </p>

        <div className="summary-panel">
          <div>
            <span>College</span>
            <strong>{formData.education.college || 'Not provided'}</strong>
          </div>
          <div>
            <span>City</span>
            <strong>{formData.education.city || 'Not provided'}</strong>
          </div>
          <div>
            <span>Interest</span>
            <strong>{formData.profile.interests[0] || 'Multiple interests'}</strong>
          </div>
        </div>

        <button type="button" className="primary-button full-width" onClick={() => setScreen('landing')}>
          Start exploring
        </button>
      </div>
    </div>
  )

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {screen === 'landing' && renderLanding()}
      {screen === 'terms' && renderTerms()}
      {screen === 'learn-more' && renderLearnMore()}
      {screen === 'wizard' && renderWizard()}
      {screen === 'success' && renderSuccess()}
    </>
  )
}

export default App
