OV.PackingNotes = {
  render(permissionService, noteValue){
    const canPack=permissionService.has(OV.PERMISSIONS.PACKING_PACK);

    return `
      <section class="card notes-card">
        <div class="notes-title">
          ${OV.Icon("edit")}
          Packing Notes
          <span>(Optional)</span>
        </div>

        ${canPack ? `
          <div class="notes-wrap">
            <textarea id="packingNotes" class="notes-field" maxlength="200"
              placeholder="Add any notes for packing, special instructions, or item conditions...">${OV.escape(noteValue)}</textarea>
            <span class="note-count" id="noteCount">${noteValue.length} / 200</span>
          </div>
        ` : `
          <div class="permission-note">
            Packing notes are read-only in this prototype state. Editing requires <strong>${OV.PERMISSIONS.PACKING_PACK}</strong>.
          </div>
        `}
      </section>
    `;
  }
};
