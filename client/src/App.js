import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EventDetailsPage from './pages/eventDetailsPage';
import PaymentPage from './pages/PaymentPage';
import CreateEventPage from './pages/CreateEventPage';
import { getUserById, updateUserOrganization } from './utils/api'; // Import API functions
import TokenUtil from './utils/TokenUtil';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [organization, setOrganization] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const requestedScopes = ["openid", "profile", "email"];

  useEffect(() => {
    const handleAuth = async () => {
      if (isAuthenticated) {
        try {
          await checkUserInDatabase();
        } catch (error) {
          console.error('Error handling auth:', error);
        }
      }
    };

    handleAuth();
  }, [isAuthenticated]);

  const checkUserInDatabase = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          scope: requestedScopes.join(" "),
        },
      });

      TokenUtil.setToken(token);

      const response = await getUserById(user.sub);

      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();

        // Check if user data exists
        if (data && data.user) {
          console.log('User is found:', data.user);
        } else {
          console.log('User not found');
        }
      }
    } catch (error) {
      //throw new Error(`HTTP error! Status: ${response.status}`);
      console.log("usernot found");
      if(error.response.status != 401)
        setShowModal(true);
      console.error('Error checking user in database:', error);
    }
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission
  
    try {
      await updateUserOrganization(user.sub, organization, firstName, lastName, user.email);
      setShowModal(false); // Close the modal after successful submission
      window.location.reload(); // Re-render the entire page
    } catch (error) {
      console.error('Error submitting modal form:', error);
    }
  };
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <nav className="navbar navbar-expand-lg navbar-light">
  <Link className="navbar-brand" to="/">Event Finder</Link>
  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
  </button>
  <div className="collapse navbar-collapse" id="navbarNav">
    <ul className="navbar-nav mr-auto">
      <li className="nav-item">
        <input
          type="text"
          className="form-control"
          placeholder="Search for events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </li>
    </ul>
    <ul className="navbar-nav ml-auto">
      {isAuthenticated ? (
        <>
          <li className="nav-item">
            <Link to="/profile">
              <button className="btn btn-primary">Profile</button>
            </Link>
          </li>
          <li className="nav-item">
            <button className="btn btn-danger" onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
          </li>
        </>
      ) : (
        <li className="nav-item">
          <button className="btn btn-primary" onClick={() => loginWithRedirect()}>Log In</button>
        </li>
      )}
      {/* <li className="nav-item">
        <button className="btn btn-info" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</button>
      </li> */}
      <li>
        <div>
          {isAuthenticated ? (
            <p>Hello, {user.name}</p>
          ) : null}
        </div>
      </li>
    </ul>
  </div>
</nav>

      <Routes>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events/:eventID" element={<EventDetailsPage />} />
        <Route path="/events/:eventID/payment" element={<PaymentPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
      </Routes>
      
      {showModal && (
  <div className="modal-backdrop">
    <div
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Additional Information Required</h5>
            {/* Removed close button to prevent manual closing */}
          </div>
          <div className="modal-body">
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  value={user.email}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="organization">Organization:</label>
                <input
                  type="text"
                  className="form-control"
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      
    </div>
  );
}

export default App;
