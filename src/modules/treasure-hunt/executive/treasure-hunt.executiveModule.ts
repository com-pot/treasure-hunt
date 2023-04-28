import { defineExecutiveModule } from "../../typeful-executive/executive";

import currentTimeIs from "./conditions/currentTimeIs";
import playerHasItem from "./conditions/playerHasItem";
import playerInteractedWithStoryPart from "./conditions/playerInteractedWithStoryPart";
import noActiveTimeout from "./conditions/noActiveTimeout";

import collectItem from "./actions/collectItem";
import startTimeout from "./actions/startTimeout";
import completeStoryPart from "./actions/completeStoryPart";
import uiDisplayContent from "./actions/ui-displayContent";

export default defineExecutiveModule({
    conditionTypes: {
        currentTimeIs,
        playerHasItem,
        playerInteractedWithStoryPart,

        noActiveTimeout,
    },
    actionTypes: {
        collectItem,
        completeStoryPart,
        startTimeout,

        'ui.displayContent': uiDisplayContent,
    },
})
