//@ts-nocheck

import tinymce, { type Editor } from "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
import "tinymce/skins/ui/oxide/skin.min.css";

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import "tinymce/plugins/advlist";
// import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
// import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
// import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
// import "tinymce/plugins/fullscreen";
// import "tinymce/plugins/help";
import "tinymce/plugins/image";
// import "tinymce/plugins/importcss";
// import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
// import "tinymce/plugins/preview";
// import "tinymce/plugins/quickbars";
// import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
// import "tinymce/plugins/typography";
// import "tinymce/plugins/template";
// import "tinymce/plugins/visualblocks";
// import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";

// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";

import "tinymce/skins/content/default/content.min.css";
import "tinymce/skins/ui/oxide/content.min.css";

export type IEditor = Editor;
export default tinymce;
