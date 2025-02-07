document.getElementById("submitBtn").addEventListener("click", function(){
    let selectedPage = document.getElementById("disasterSelect").value;
    if (selectedPage) {
      document.body.classList.add("fade-out"); // Apply fade effect
      window.location.href = selectedPage;
    } 
    else{
      alert("Please select an option!");
    }
});