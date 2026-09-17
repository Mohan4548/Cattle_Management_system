/* FarmEase Visual Family Tree & Genogram Module */

const FamilyTreeModule = {
  renderFamilyTree(containerId, targetCattleTag) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = DataStore.get();
    const targetCattle = data.cattles.find(c => c.tagNumber === targetCattleTag) || data.cattles[0];

    // Find mother and grandmother
    const mother = data.cattles.find(c => c.tagNumber === targetCattle.motherTag) || {
      tagNumber: targetCattle.motherTag || "FE-COW-MOTHER",
      nickname: "Mother Cow",
      breed: targetCattle.breed,
      photo: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150"
    };

    const grandmother = data.cattles.find(c => c.tagNumber === targetCattle.grandMotherTag) || {
      tagNumber: targetCattle.grandMotherTag || "FE-COW-GRANDMOTHER",
      nickname: "Matriarch Founder",
      breed: targetCattle.breed,
      photo: "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=150"
    };

    // Find offspring / calves of target animal
    const calves = data.cattles.filter(c => c.motherTag === targetCattle.tagNumber);

    container.innerHTML = `
      <div class="family-tree-container">
        <!-- Level 1: Grandmother -->
        <div class="tree-level">
          <div class="tree-node-card" onclick="App.openCattleModalByTag('${grandmother.tagNumber}')">
            <img src="${grandmother.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" class="tree-node-avatar" alt="${grandmother.nickname}">
            <div class="tree-node-tag">${grandmother.tagNumber}</div>
            <div class="tree-node-name">${grandmother.nickname}</div>
            <span class="badge badge-available">Grandmother</span>
          </div>
        </div>

        <div class="tree-connector-down"></div>

        <!-- Level 2: Mother -->
        <div class="tree-level">
          <div class="tree-node-card" onclick="App.openCattleModalByTag('${mother.tagNumber}')">
            <img src="${mother.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" class="tree-node-avatar" alt="${mother.nickname}">
            <div class="tree-node-tag">${mother.tagNumber}</div>
            <div class="tree-node-name">${mother.nickname}</div>
            <span class="badge badge-pregnant">Mother</span>
          </div>
        </div>

        <div class="tree-connector-down"></div>

        <!-- Level 3: Current Selected Animal -->
        <div class="tree-level">
          <div class="tree-node-card active-target" onclick="App.openCattleModalByTag('${targetCattle.tagNumber}')">
            <img src="${targetCattle.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" class="tree-node-avatar" alt="${targetCattle.nickname}">
            <div class="tree-node-tag">${targetCattle.tagNumber}</div>
            <div class="tree-node-name">${targetCattle.nickname}</div>
            <span class="badge badge-healthy">Current Animal</span>
          </div>
        </div>

        <div class="tree-connector-down"></div>

        <!-- Level 4: Calves / Offspring -->
        <div class="tree-level">
          ${calves.length > 0 ? calves.map(calf => `
            <div class="tree-node-card" onclick="App.openCattleModalByTag('${calf.tagNumber}')">
              <img src="${calf.photo || DEFAULT_COW_IMAGE}" onerror="this.src=DEFAULT_COW_IMAGE" class="tree-node-avatar" alt="${calf.nickname}">
              <div class="tree-node-tag">${calf.tagNumber}</div>
              <div class="tree-node-name">${calf.nickname}</div>
              <span class="badge badge-available">Calf / Offspring</span>
            </div>
          `).join('') : `
            <div class="tree-node-card" style="opacity:0.6; border-style:dashed;">
              <div style="font-size:2rem; color:var(--text-muted);"><i class="fa-solid fa-baby"></i></div>
              <div class="tree-node-name" style="color:var(--text-muted);">Future Generation</div>
              <span class="badge badge-sold">No Offspring Logged Yet</span>
            </div>
          `}
        </div>
      </div>
    `;
  }
};

window.FamilyTreeModule = FamilyTreeModule;
