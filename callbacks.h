#include <gtk/gtk.h>



void
on_gestionouvrier_clicked              (GtkButton       *button,
                                        gpointer         user_data);

void
on_quitter_clicked                     (GtkButton       *button,
					gpointer         user_data);

void
on_ajouter_clicked                     (GtkButton       *button,
                                        gpointer         user_data);

void
on_modifier2_clicked                   (GtkButton       *button,
                                        gpointer         user_data);

void
on_supprimer1_clicked                  (GtkButton       *button,
                                        gpointer         user_data);

void
on_chercher_clicked                    (GtkButton       *button,
                                        gpointer         user_data);


void
on_treeview_row_activated             (GtkTreeView     *treeview,
                                        GtkTreePath     *path,
                                        GtkTreeViewColumn *column,
                                        gpointer         user_data);


void
on_radiobutton1_toggled                (GtkToggleButton *togglebutton,
                                        gpointer         user_data);

void
on_buttonvalider_clicked               (GtkButton       *button,
                                        gpointer         user_data);

void
on_radiobuttonoui_toggled              (GtkToggleButton *togglebutton,
                                        gpointer         user_data);

void
on_radiobuttonnon_toggled              (GtkToggleButton *togglebutton,
                                        gpointer         user_data);

void
on_checkbutton2_toggled                (GtkToggleButton *togglebutton,
                                        gpointer         user_data);
