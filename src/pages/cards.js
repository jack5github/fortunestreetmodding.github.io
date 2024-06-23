export function display_cards() {
    /*
    Controls the display of venture cards based on the selected filters.
    */
    const difficulty = document.getElementById("difficulty");
    for (let i = 1; i <= 128; i++) {
        const card = document.getElementById("card" + i.toString());
        if (card === null) { continue; } // Failure case if card doesn't exist
        card.style.display = "block"; // Display by default
        // Get attributes
        const cardEasy = card.getAttribute("data-easy") === "true";
        const cardStandard = card.getAttribute("data-standard") === "true";
        const cardSentiment = parseInt(card.getAttribute("data-sentiment"));
        const cardRank = parseInt(card.getAttribute("data-rank"));
        const cardType = card.getAttribute("data-type");
        const cardEffect = card.getAttribute("data-effect");
        // Check difficulty filter
        if (difficulty.value === "both" && (!cardEasy || !cardStandard)) {
            card.style.display = "none";
            continue;
        } else if (difficulty.value === "easy" && !cardEasy) {
            card.style.display = "none";
            continue;
        } else if (difficulty.value === "standard" && !cardStandard) {
            card.style.display = "none";
            continue;
        } else if (difficulty.value === "neither" && (cardEasy || cardStandard)) {
            card.style.display = "none";
            continue;
        }
        // Check sentiment filters
        if (!document.getElementById("sentimentPositive").checked && cardSentiment === 1) {
            card.style.display = "none";
            continue;
        } else if (!document.getElementById("sentimentNeutral").checked && cardSentiment === 0) {
            card.style.display = "none";
            continue;
        } else if (!document.getElementById("sentimentNegative").checked && cardSentiment === -1) {
            card.style.display = "none";
            continue;
        }
        // Check rank filters
        for (let j = 0; j <= 4; j++) {
            if (!document.getElementById("rank" + j.toString()).checked && cardRank === j) {
                card.style.display = "none";
                break;
            }
        }
        // Check type filter
        let typesOptions = document.getElementById("types").options;
        for (let j = 0; j < typesOptions.length; j++) {
            let option = typesOptions[j];
            if (option.value === cardType) {
                if (!option.selected) {
                    card.style.display = "none";
                }
                break;
            }
        }
        // Check effect filter
        let effectsOptions = document.getElementById("effects").options;
        for (let j = 0; j < effectsOptions.length; j++) {
            let option = effectsOptions[j];
            if (option.value === cardEffect) {
                if (!option.selected) {
                    card.style.display = "none";
                }
                break;
            }
        }
    }
}

export function reset_filters() {
    /*
    Resets all the filters to their default values, then refreshes the venture cards.
    */
    document.getElementById("difficulty").value = "any";
    for (let i = 0; i <= 4; i++) {
        document.getElementById("rank" + i.toString()).checked = true;
    }
    document.getElementById("sentimentPositive").checked = true;
    document.getElementById("sentimentNeutral").checked = true;
    document.getElementById("sentimentNegative").checked = true;
    let typesOptions = document.getElementById("types").options;
    for (let i = 0; i < typesOptions.length; i++) {
        typesOptions[i].selected = true;
    }
    let effectsOptions = document.getElementById("effects").options;
    for (let i = 0; i < effectsOptions.length; i++) {
        effectsOptions[i].selected = true;
    }
    display_cards();
}

export function reset_selected_cards() {
    /*
    Returns all venture cards to their default state (selected if they are default to the Standard difficulty), then updates the selected card counter.
    */
    for (let i = 1; i <= 128; i++) {
        document.getElementById("card" + i.toString() + "selected").checked = document.getElementById("card" + i.toString()).getAttribute("data-standard") === "true";
    }
    check_selected_cards();
}

export function check_selected_cards() {
    /*
    Count the number of venture cards that are selected, and updates the card counter and generate YAML button accordingly.

    Returns:
        boolean: true if there are exactly 64 selected cards, false otherwise.
    */
    document.getElementById("yaml").style.display = "none";
    let chosenCards = 0;
    for (let i = 1; i <= 128; i++) {
        if (document.getElementById("card" + i.toString() + "selected").checked) {
            chosenCards++;
            document.getElementById("card" + i.toString()).style.opacity = 1;
        } else {
            document.getElementById("card" + i.toString()).style.opacity = 0.625;
        }
    }
    document.getElementById("cardsSelected").textContent = chosenCards.toString() + " cards selected";
    if (chosenCards === 64) {
        document.getElementById("generateYaml").disabled = false;
    } else {
        document.getElementById("generateYaml").disabled = true;
    }
    return chosenCards === 64;
}

export function select_all_cards(select = true) {
    /*
    Selects or deselects all 128 venture cards, then updates the selected card counter.

    Args:
        select (boolean): true to select all cards, false to deselect them.
    */
    for (let i = 1; i <= 128; i++) {
        document.getElementById("card" + i.toString() + "selected").checked = select;
    }
    check_selected_cards();
}

export function select_visible_cards(select = true) {
    /*
    Selects or deselects any visible venture cards, then updates the selected card counter.

    Args:
        select (boolean): true to select visible cards, false to deselect them.
    */
    for (let i = 1; i <= 128; i++) {
        console.log(i, document.getElementById("card" + i.toString()).style.display);
        if (document.getElementById("card" + i.toString()).style.display === "block") {
            document.getElementById("card" + i.toString() + "selected").checked = select;
        }
    }
    check_selected_cards();
}

export function generate_yaml() {
    /*
    Generates and displays the YAML for the selected venture cards if there are exactly 64 selected cards.
    */
    if (check_selected_cards()) {
        let yaml_str = "ventureCards:";
        for (let i = 1; i <= 128; i++) {
            let yaml_selected = "0";
            if (document.getElementById("card" + i.toString() + "selected").checked) {
                yaml_selected = "1";
            }
            // Add spaces in front of the venture card number to make the YAML easier to read
            let i_str = i.toString();
            if (i < 100) {
                i_str = " " + i_str;
                if (i < 10) {
                    i_str = " " + i_str;
                }
            }
            yaml_str = yaml_str + "\n  - " + yaml_selected + "  # " + i_str;
        }
        document.getElementById("generatedYaml").textContent = yaml_str;
        document.getElementById("copyYaml").innerText = "Copy to clipboard";  // Reset from copy_yaml_to_clipboard()
        document.getElementById("yaml").style.display = "block";
        document.getElementById("yaml").scrollIntoView({behavior: "smooth"});
    }
}

export function copy_yaml_to_clipboard() {
    /*
    Copies the generated YAML to the clipboard and updates the copy button text.
    */
    navigator.clipboard.writeText(document.getElementById("generatedYaml").textContent);
    document.getElementById("copyYaml").innerText = "Copied!";
}
