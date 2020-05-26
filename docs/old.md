# WebJuGEx: Differential gene expression analysis

WebJuGEx is the [open source plugin](https://github.com/FZJ-INM1-BDA/webjugex-iav-plugin) for interactive atlas viewer, which represents [JuGEx - JuBrain Gene Expression](https://www.fz-juelich.de/inm/inm-1/DE/Forschung/_docs/JuGex/JuGex_node.html) inside the web viewer.

WebGuGEx plugin is available for the parcellation `JuBrain Cytoarchitectonic Atlas` into the `ICBM 2009c Nonlinear Asymmetric` template space.


## JuGEx
The JuGEx is a solution to find a set of differentially expressed genes between two user-defined volumes of interest-based on JuBrain maps.

The tool downloads expression values of user-specified sets of genes from Allen Brain API1.

Then, it uses zscores to find which genes are expressed differentially between the user-specified regions of interests.

After the analysis is finished, the genes and their calculated p values are displayed. There is also an option of downloading the gene names and their p values and the ROI coordinates used in the analysis.

##Getting started
- Select template `ICBM 2009c Nonlinear Asymmetric`, parcellation `JuBrain Cytoarchitectonic Atlas` and `click` on the `Plugins and Tools` button at the top-right side of the interactive viewer to open plugins and tools menu.

   [![](../images/jugextoolmenu.png)](../images/jugextoolmenu.png)

- `Click` the `JuGEx: Differential gene expression analysis` button to open WebJuGEx plugin

   [![](../images/jugex_default.png)](../images/jugex_default.png)

##Working with WebJuGEx
To get desired `probe locations` and calculated `p values`, we need to specify two sides of volumes and differentially expressed genes

Each volume is the single or collection of JuBrain regions.
Differentially expressed genes are sets of genes from Allen Brain API<sup>1</sup>

JuGEx description is located on the top-side of the plugin. You can expand/collapse description by clicking `readmore`/`readless` buttons after the text

|  |  |
| --- | --- |
| [![](../images/jugex_desc_exp.png)](../images/jugex_desc_exp.png)  | [![](../images/jugex_desc_coll.png)](../images/jugex_desc_coll.png) |



###Select JuBrain region(s)
Under the plugin description, you can find two input areas named `Region(s) 1` and `Region(s) 2`. From here you can specify 2 sides of volumes.

[![](../images/jugexregions.png)](../images/jugexregions.png)

There are two ways to select regions in JuGEx plugin

1. Type volume name into the input field under the label `Region(s) 1`

    [![](../images/jugexregiontype.png)](../images/jugexregiontype.png)

    From the listed regions, `click` on interested one to add to the collection for the region(s) 1. Selected areas for `Region(s) 1` is located under the input field.

    [![](../images/jugex_selected_region.png)](../images/jugex_selected_region.png)

2. You can select a region by clicking the signal icon on the right side of the input field. The color of the button should change from black to green.
    
    [![](../images/jugex_scan_button.png)](../images/jugex_scan_button.png)

    Button switches on region selection mode into the interactive atlas viewer. After the activation of mode, at the top of the viewer, you can see a panel with text `Region Selection Mode for Region(s) 1`.
    Single `click` on region into the viewer to add the desired volume into the list of `Region(s) 1`.
        
    [![](../images/jugex_region_selection.png)](../images/jugex_region_selection.png)
    
    To switch off region selection mode, `click` on signal region again and color will return back from green to black.
    
Repeat same activity for `Region(s) 2`.

###Select genes
Selecting genes if available from `Gene(s)` panel, under the `Region(s) 2` selected volumes.

There are two ways to select genes in JuGEx plugin

1. Type the `gene name` into the input field and select one from the listed genes. Selected genes are located under the input field.

   [![](../images/jugex_gene_type.png)](../images/jugex_gene_type.png)

2. Import JSON file of a stringified list of gene names, E.g. `["MAOA","TAC1"]`. `Import` button is located next to the input field.
   
   [![](../images/jugex_import_gene.png)](../images/jugex_import_gene.png)

You can export the list of selected genes as `Json` format file. `Export` button is located next to the `Import` button

   [![](../images/jugex_export_gene.png)](../images/jugex_export_gene.png)

###Settings

Before start differential analysis, you can specify special settings to filter expected probe locations and calculated p values.

`Click` `Settings` button under the `Gene(s)` list to expand settings panel.
   [![](../images/jugex_filter.png)](../images/jugex_filter.png)
 
Into the panes there is possible to set 
 
 - `Probe Mode` between `All` (default) and `Single`
 - `Custom probe` between `Use`(default) and `ignore`
 - `Threshold` from `0,05` to `1,00` (default is `0.20`)
 - `No. of Perm` any number (default is `1000`)

To reset filter to its default values, `click` at `Reset to default` button at the top-right corner at `settings` panel.

###Start analysis
To start analysis, `click` on `Start Differential Analysis` button at the end of the plugin window.
   
   [![](../images/jugex_start_analysis.png)](../images/jugex_start_analysis.png)
   
Before results will be ready, you will see the loading bar with text `analysis in progress`.

####Save to HBP jupyter hub
After `click` on `Start Differential Analysis`, `Save to HBP jupyter hub` button will appear below it. 

-- To Edit (Please help) -- Click `Save to HBP jupyter hub` to save --Logic (Please help)-- as python script and redirect to HBP jupyter hub
   
   [![](../images/jugex_save_to_jupiter.png)](../images/jugex_save_to_jupiter.png)

####Display probe locations

To display probe locations on the interactive viewer, `switch on` special toggle located under `Save to HBP jupyter hub` button
   
   [![](../images/jugex_display_probe.png)](../images/jugex_display_probe.png)

After `switching toggle on`, probes will be displayed at interactive atlas viewer

   [![](../images/jugex_probes_on_viewer.png)](../images/jugex_probes_on_viewer.png)


####Export data
After getting analyzed data, you can export `tsv` format files for `p values` and `probe locations`.
   
   [![](../images/jugex_export.png)](../images/jugex_export.png)
   
Click on buttons `p values` or `probe locations` to download relevant data.

`Hover` the preferred export button to preview data before download

   [![](../images/jugex_preview_data.png)](../images/jugex_preview_data.png)




##References
<sup>1</sup> © 2015 Allen Institute for Brain Science. Allen Brain Atlas API. Available from: <http://brain-map.org/api/index.html>

