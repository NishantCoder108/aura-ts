const NotFound = () => {
  return (
    <div>
      <h1>Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <button onClick={() => (window.location.href = "/")}>Go Home</button>
    </div>
  );
};

export default NotFound;
