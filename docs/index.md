# WebJuGEx - Differential gene expression analysis

WebJuGEx is a simple and intuitive graphical user interface for [JuGEx](https://pyjugex.readthedocs.io/) - a workflow for analyzing differential gene expressions in different regions of the JuBrain probabilistic cytoarchitectonic human brain atlas. It is implemented as an [interactive open source plugin](https://github.com/fzj-inm1-bda/webjugex-iav-plugin) for the [EBRAINS interactive atlas viewer](http://atlases.ebrains.eu/viewer/), and uses the Python implementation of the algorithm.

The  plugin is available for the JuBrain probabilistic cytoarchitectonic Atlas as defined in the  ICBM 2009c Nonlinear Asymmetric. It connects the probabilistic brain region definitions of the JuBrain cytoarchitectonic atlas with gene expression data retrieved from the Allen Human Brain Atlas (© 2015 Allen Institute for Brain Science. Allen Brain Atlas API. Available from: <https://brain-map.org/api/index.html>). In particular, the user selects two different brain areas from the atlas, and specifies a list of candidate genes. The tool will then retrieve all related gene expression data from the Allen atlas that corresponds to these areas, and perform a differential analysis.

The algorithm with its original implementation in Matlab has been developed by S. Bludau  Sebastian et al. (2018): 

> _Bludau, Thomas W. Mühleisen, Simon B. Eickhoff, Michael J. Hawrylycz, Sven Cichon, Katrin Amunts. Integration of transcriptomic and cytoarchitectonic data implicates a role for MAOA and TAC1 in the limbic-cortical network. 2018, Brain Structure and Function <https://doi.org/10.1007/s00429-018-1620-6>._

After the analysis is finished, the p-values for the differential expression of the selected genes in the desired areas are displayed. All data can be downloaded as a structured text file. The Python code corresponding to the analysis can be exported to a Python notebook for extended experiments. 
