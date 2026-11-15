import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import { useSession } from './useSession';

export default function Layout() {
  const { email, onLogout } = useSession();

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="sm">
        <Container>
          <Navbar.Brand>Quiz Builder</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <NavLink className="nav-link" to="/quizzes">
                Quizzes
              </NavLink>
              <NavLink className="nav-link" to="/create">
                Create
              </NavLink>
            </Nav>
            <Navbar.Text className="me-3">{email}</Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={onLogout}>
              Log out
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}