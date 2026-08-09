import React from "react";
import "../css/modal.css";

export default function Modal({ children, modalOpen, isModalOpen }) {
  if (modalOpen == false) return;

  const handleClose = (e) => {
    if (e.target.className == "modal" || "btn-cerrar") {
      isModalOpen(false);
    }
  };

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-body">
        <div className="modal-title">
          <h1>Titulo de prueba</h1>
          <button className="btn-cerrar" onClick={handleClose}>
            X
          </button>
        </div>
        <div className="modal-content">{children}</div>
        <div className="modal-footer">
          <p>Footer de prueba</p>
        </div>
      </div>
    </div>
  );
}
