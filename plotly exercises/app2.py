# # import packages
# from dash import Dash, html

# # initialize a Dash app
# app = Dash()

# # add text property to div html component 
# app.layout = [html.Div(children='Hello World!')]

# # standard app run statement in Dash
# if __name__ == '__main__':
#     app.run(debug=True)

# Import packages
from dash import Dash, html, dash_table, dcc, callback, Output, Input
import pandas as pd
import plotly.express as px

# Incorporate data
df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder2007.csv')

# Initialize the app - incorporate css
external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = Dash(external_stylesheets=external_stylesheets)

# App layout
app.layout = [
    html.Div(className='row', children='My First App with Data, Graph, and Controls',
             style={'textAlign': 'center', 'color': 'blue', 'fontSize': 30}),

    html.Div(className='row', children=[
        dcc.RadioItems(options=['pop', 'lifeExp', 'gdpPercap'],
                       value='lifeExp',
                       inline=True,
                       id='my-radio-buttons-final')
    ]),

    html.Div(className='row', children=[
        html.Div(className='six columns', children=[
            dash_table.DataTable(data=df.to_dict('records'), page_size=11, style_table={'overflowX': 'auto'})
        ]),
        html.Div(className='six columns', children=[
            dcc.Graph(figure={}, id='histo-chart-final')
        ])
    ])
]

# Add controls to build the interaction
@callback(
    Output(component_id='histo-chart-final', component_property='figure'),
    Input(component_id='my-radio-buttons-final', component_property='value')
)
def update_graph(col_chosen):
    fig = px.histogram(df, x='continent', y=col_chosen, histfunc='avg')
    return fig

# Run the app
if __name__ == '__main__':
    app.run(debug=True)

# import dash_design_kit as ddk
#     ddk.Row([
#         ddk.Card([
#             dash_table.DataTable(data=df.to_dict('records'), page_size=12, style_table={'overflowX': 'auto'})
#         ], width=50),
#         ddk.Card([
#             ddk.Graph(figure={}, id='graph-placeholder-ddk-final')
#         ], width=50),
#     ]),

# import dash_bootstrap_components as dbc
#     dbc.Row([
#         dbc.RadioItems(options=[{"label": x, "value": x} for x in ['pop', 'lifeExp', 'gdpPercap']],
#                        value='lifeExp',
#                        inline=True,
#                        id='radio-buttons-final')
#     ]),

#     dbc.Row([
#         dbc.Col([
#             dash_table.DataTable(data=df.to_dict('records'), page_size=12, style_table={'overflowX': 'auto'})
#         ], width=6),

#         dbc.Col([
#             dcc.Graph(figure={}, id='my-first-graph-final')
#         ], width=6),
#     ]),

